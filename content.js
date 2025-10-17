// Shopping Music Player - Content Script
// Toca música quando o usuário entra em sites de compras

class ShoppingMusicPlayer {
    constructor() {
        this.audioElement = null;
        this.isPlaying = false;
        this.intentionalPause = false;
        this.musicUrl = 'https://www.youtube.com/watch?v=3_soYT__b9U&list=PL49AC5D420FA55436&index=8';
        this.currentDomain = window.location.hostname;
        this.controlsAdded = false;
        this.instanceId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        this.globalKey = 'shopping_music_global_state';
        this.isInitialized = false;
        
        // Configuração de múltiplas músicas
        this.musicTracks = [
            {
                id: 'shop-1',
                name: 'Shopping Music 1',
                file: 'audio/shop-1.mp3'
            },
            {
                id: 'shop-2', 
                name: 'Shopping Music 2',
                file: 'audio/shop-2.mp3'
            }
        ];
        this.currentTrackIndex = 0;
        this.randomMode = false;
        
        // 🔄 Sistema de Continuidade Musical
        this.continuityKey = 'shopping_music_continuity';
        this.lastSaveTime = 0;
        this.autoSaveInterval = null;
        this.maxContinuityTime = 30 * 60 * 1000; // 30 minutos
        
        console.log(`🎵 Criando instância [${this.instanceId}] no domínio: ${this.currentDomain}`);
        this.init();
    }

    async init() {
        if (this.isInitialized) {
            console.log(`⚠️ Instância já inicializada [${this.instanceId}]`);
            return;
        }

        console.log(`🎵 Inicializando Shopping Music Player [${this.instanceId}]...`);
        
        // Verifica se já existe uma instância ativa
        const existingState = await this.getGlobalState();
        const now = Date.now();
        
        // Se existe uma instância ativa nos últimos 10 segundos, tenta assumir controle
        if (existingState && existingState.isActive && (now - existingState.timestamp) < 10000) {
            console.log(`🎵 Instância ativa encontrada [${existingState.instanceId}], aguardando ou assumindo controle [${this.instanceId}]`);
            
            // Aguarda 3 segundos e verifica novamente
            setTimeout(async () => {
                const recentState = await this.getGlobalState();
                const timeNow = Date.now();
                
                // Se a outra instância não atualizou timestamp, assume controle
                if (!recentState || !recentState.isActive || (timeNow - recentState.timestamp) > 8000) {
                    console.log(`🔄 Assumindo controle de instância inativa [${this.instanceId}]`);
                    await this.forceInit();
                } else {
                    console.log(`⏸️ Outra instância ainda ativa, mantendo standby [${this.instanceId}]`);
                    // Mantém em standby para assumir controle se necessário
                    this.setupStandbyMode();
                }
            }, 3000);
            return;
        }

        // Se não há instância ativa ou é muito antiga, inicializa normalmente
        await this.forceInit();
    }

    async forceInit() {
        console.log(`💪 Forçando inicialização [${this.instanceId}]`);
        
        // Registra esta instância como ativa
        await this.setGlobalState({
            isActive: true,
            instanceId: this.instanceId,
            domain: this.currentDomain,
            isPlaying: false,
            timestamp: Date.now(),
            tabId: await this.getCurrentTabId()
        });

        this.isInitialized = true;
        
        // ⚡ EXECUÇÃO IMEDIATA - Não espera DOM pois só precisa da URL
        console.log(`🚀 Iniciando música imediatamente [${this.instanceId}]...`);
        this.checkAndStart();

        // Escuta mensagens do background script
        this.setupMessageListener();
        
        // Monitora outras instâncias
        this.startInstanceMonitoring();
    }

    setupStandbyMode() {
        console.log(`⏸️ Modo standby ativado [${this.instanceId}]`);
        
        // Verifica a cada 5 segundos se pode assumir controle
        this.standbyInterval = setInterval(async () => {
            const currentState = await this.getGlobalState();
            const now = Date.now();
            
            if (!currentState || !currentState.isActive || (now - currentState.timestamp) > 8000) {
                console.log(`🔄 Saindo do standby e assumindo controle [${this.instanceId}]`);
                clearInterval(this.standbyInterval);
                await this.forceInit();
            }
        }, 5000);
    }

    async getCurrentTabId() {
        try {
            // Content scripts não podem usar chrome.tabs diretamente
            // Solicita ao background script
            const response = await chrome.runtime.sendMessage({ action: 'getCurrentTab' });
            return response?.tabId || null;
        } catch (error) {
            console.log('Erro ao obter tab ID:', error);
            return null;
        }
    }

    async getGlobalState() {
        return new Promise((resolve) => {
            chrome.storage.local.get([this.globalKey], (result) => {
                resolve(result[this.globalKey] || null);
            });
        });
    }

    async setGlobalState(state) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [this.globalKey]: state }, resolve);
        });
    }

    async clearGlobalState() {
        return new Promise((resolve) => {
            chrome.storage.local.remove([this.globalKey], resolve);
        });
    }

    // ⚡ OTIMIZAÇÃO: Aguarda DOM de forma não-bloqueante
    async ensureDOMReady() {
        return new Promise((resolve) => {
            if (document.documentElement) {
                // DOM já está disponível
                resolve();
            } else {
                // Aguarda DOM ficar disponível
                const checkDOM = () => {
                    if (document.documentElement) {
                        resolve();
                    } else {
                        setTimeout(checkDOM, 10); // Verifica a cada 10ms
                    }
                };
                checkDOM();
            }
        });
    }

    // ========== SISTEMA DE CONTINUIDADE MUSICAL ==========
    
    async saveMusicContinuity() {
        if (!this.audioElement || !this.isPlaying) {
            return;
        }

        const continuityData = {
            trackIndex: this.currentTrackIndex,
            currentTime: this.audioElement.currentTime,
            volume: this.audioElement.volume,
            randomMode: this.randomMode,
            isPlaying: this.isPlaying,
            domain: this.currentDomain,
            url: window.location.href,
            timestamp: Date.now(),
            instanceId: this.instanceId,
            sessionId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        await chrome.storage.local.set({ [this.continuityKey]: continuityData });
        this.lastSaveTime = Date.now();
        
        console.log(`💾 Continuidade salva: ${this.musicTracks[this.currentTrackIndex].name} em ${Math.floor(continuityData.currentTime)}s`);
    }

    async loadMusicContinuity() {
        try {
            const result = await chrome.storage.local.get([this.continuityKey]);
            const continuityData = result[this.continuityKey];

            if (!continuityData) {
                console.log(`📂 Nenhum estado de continuidade encontrado`);
                return null;
            }

            const age = Date.now() - continuityData.timestamp;
            
            // Ignora estados muito antigos (mais de 30 minutos)
            if (age > this.maxContinuityTime) {
                console.log(`⏰ Estado de continuidade muito antigo (${Math.floor(age / 60000)} min), ignorando`);
                await this.clearMusicContinuity();
                return null;
            }

            // Verifica se é do mesmo domínio ou domínio relacionado
            const currentDomain = window.location.hostname;
            const savedDomain = continuityData.domain;
            
            if (!this.isRelatedDomain(currentDomain, savedDomain)) {
                console.log(`🌐 Domínio diferente: ${currentDomain} vs ${savedDomain}, ignorando continuidade`);
                return null;
            }

            console.log(`🔄 Estado de continuidade carregado: ${this.musicTracks[continuityData.trackIndex]?.name || 'música'} em ${Math.floor(continuityData.currentTime)}s`);
            return continuityData;

        } catch (error) {
            console.error('Erro ao carregar continuidade:', error);
            return null;
        }
    }

    isRelatedDomain(currentDomain, savedDomain) {
        // Considera domínios relacionados (ex: amazon.com e amazon.com.br)
        const extractBaseDomain = (domain) => {
            return domain.replace(/^www\./, '').split('.').slice(-2).join('.');
        };

        const currentBase = extractBaseDomain(currentDomain);
        const savedBase = extractBaseDomain(savedDomain);

        // Mesmo domínio base ou ambos são sites de compras
        return currentBase === savedBase || 
               (this.isShoppingSite(currentDomain) && this.isShoppingSite(savedDomain));
    }

    isShoppingSite(domain) {
        const shoppingSites = [
            'mercadolivre.com', 'mercadolibre.com', 'amazon.com', 'ebay.com',
            'aliexpress.com', 'shopee.com', 'americanas.com', 'submarino.com',
            'casasbahia.com', 'magazineluiza.com'
        ];
        
        return shoppingSites.some(site => domain.includes(site));
    }

    async clearMusicContinuity() {
        await chrome.storage.local.remove([this.continuityKey]);
        console.log(`🗑️ Estado de continuidade limpo`);
    }

    async restoreFromContinuity(continuityData) {
        try {
            console.log(`🔄 Restaurando música: ${this.musicTracks[continuityData.trackIndex]?.name} em ${Math.floor(continuityData.currentTime)}s`);

            // Configura estado da instância
            this.currentTrackIndex = continuityData.trackIndex;
            this.randomMode = continuityData.randomMode;

            // Salva configurações atualizadas
            await this.saveMusicSettings();

            // Cria áudio com estado restaurado
            await this.createAudioPlayer({
                currentTime: continuityData.currentTime,
                volume: continuityData.volume
            });

            // ⚡ Adiciona controles em paralelo - não bloqueia música
            this.addMusicControls();

            // Atualiza estado global
            const globalState = await this.getGlobalState();
            await this.setGlobalState({
                ...globalState,
                isPlaying: true,
                hasAudio: true,
                trackIndex: this.currentTrackIndex,
                randomMode: this.randomMode
            });

            // Inicia auto-save
            this.startAutoSaveContinuity();

            // Notifica background
            await this.sendToBackground({
                action: 'musicRestored',
                domain: this.currentDomain,
                currentTime: continuityData.currentTime,
                volume: continuityData.volume,
                trackIndex: this.currentTrackIndex
            });

            console.log(`✅ Continuidade restaurada com sucesso [${this.instanceId}]!`);

        } catch (error) {
            console.error('Erro ao restaurar continuidade:', error);
            // Fallback: inicia música normal
            await this.startNewMusic();
        }
    }

    startAutoSaveContinuity() {
        // Auto-salva a cada 5 segundos quando tocando
        this.autoSaveInterval = setInterval(async () => {
            if (this.isPlaying && this.audioElement && !this.audioElement.paused) {
                await this.saveMusicContinuity();
            }
        }, 5000);

        console.log(`⏰ Auto-save de continuidade iniciado (5s)`);
    }

    stopAutoSaveContinuity() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log(`⏰ Auto-save de continuidade parado`);
        }
    }

    startInstanceMonitoring() {
        // Monitora a cada 3 segundos se ainda é a instância ativa
        this.monitorInterval = setInterval(async () => {
            if (!this.isInitialized) return;
            
            const globalState = await this.getGlobalState();
            
            if (!globalState || globalState.instanceId !== this.instanceId) {
                console.log(`🛑 Perdeu controle para outra instância, desativando [${this.instanceId}]`);
                this.deactivate();
            } else {
                // Atualiza timestamp para manter viva
                await this.setGlobalState({
                    ...globalState,
                    timestamp: Date.now()
                });
            }
        }, 3000);
    }

    deactivate() {
        console.log(`🔇 Desativando instância [${this.instanceId}]`);
        
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        
        if (this.standbyInterval) {
            clearInterval(this.standbyInterval);
            this.standbyInterval = null;
        }
        
        // Remove controles se existirem
        const controls = document.getElementById('shopping-music-controls');
        if (controls) {
            controls.remove();
            this.controlsAdded = false;
        }
        
        // Remove áudio órfão se não está sendo usado
        if (this.audioElement && this.audioElement.paused) {
            this.removeAudioElement();
        }
        
        this.isInitialized = false;
    }

    removeAudioElement() {
        if (this.audioElement) {
            console.log(`🧹 Removendo elemento de áudio [${this.instanceId}]`);
            
            // Marca como pausa intencional para evitar auto-retomar
            this.intentionalPause = true;
            
            this.audioElement.pause();
            this.audioElement.src = '';
            
            // Remove listeners para evitar vazamentos de memória
            if (this.timeUpdateHandler) {
                this.audioElement.removeEventListener('timeupdate', this.timeUpdateHandler);
            }
            
            if (this.audioElement.parentNode) {
                this.audioElement.remove();
            }
            
            this.audioElement = null;
            this.isPlaying = false;
        }
    }

    async checkAndStart() {
        try {
            console.log(`🔍 Verificando configurações [${this.instanceId}]...`);
            
            // Verifica se ainda é a instância ativa
            const globalState = await this.getGlobalState();
            if (!globalState || globalState.instanceId !== this.instanceId) {
                console.log(`❌ Não é mais a instância ativa [${this.instanceId}], abortando`);
                return;
            }
            
            // Verifica se a extensão está ativada
            const isEnabled = await this.getStoredSetting('musicEnabled', true);
            console.log('⚙️ Música ativada:', isEnabled);
            
            if (!isEnabled) {
                console.log('❌ Música desabilitada nas configurações');
                await this.clearGlobalState();
                return;
            }

            // 🔄 VERIFICA CONTINUIDADE MUSICAL PRIMEIRO
            const continuityData = await this.loadMusicContinuity();
            if (continuityData && continuityData.isPlaying) {
                console.log(`🔄 Restaurando continuidade musical...`);
                await this.restoreFromContinuity(continuityData);
                return;
            }

            // Procura por áudio existente global
            const existingAudio = this.findExistingAudio();
            if (existingAudio) {
                console.log(`🎵 Reutilizando áudio existente [${this.instanceId}]`);
                this.audioElement = existingAudio;
                this.isPlaying = !existingAudio.paused;
                
                if (this.isPlaying) {
                    this.setupTimeUpdateListener();
                }
                
                // ⚡ Controles em paralelo - não bloqueia música
                this.addMusicControls();
                
                // Atualiza estado global
                await this.setGlobalState({
                    ...globalState,
                    isPlaying: this.isPlaying,
                    hasAudio: true
                });
                return;
            }

            // Inicia nova música
            console.log(`🆕 Iniciando nova música [${this.instanceId}]...`);
            await this.startNewMusic();
            
        } catch (error) {
            console.error(`❌ Erro ao verificar e iniciar música [${this.instanceId}]:`, error);
        }
    }

    findExistingAudio() {
        // Procura por áudio existente do shopping music player
        const audios = document.querySelectorAll('audio[data-shopping-music="true"]');
        for (let audio of audios) {
            if (audio.src && !audio.ended) {
                return audio;
            }
        }
        return null;
    }

    // ========== GERENCIAMENTO DE MÚLTIPLAS MÚSICAS ==========
    
    async loadMusicSettings() {
        const settings = await this.getStoredSetting('musicSettings', {
            selectedTrack: 0,
            randomMode: false
        });
        
        this.currentTrackIndex = settings.selectedTrack;
        this.randomMode = settings.randomMode;
        
        console.log(`🎵 Configurações carregadas: Track ${this.currentTrackIndex}, Random: ${this.randomMode}`);
    }
    
    getCurrentTrack() {
        if (this.randomMode) {
            // Seleciona uma música aleatória diferente da atual
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * this.musicTracks.length);
            } while (randomIndex === this.currentTrackIndex && this.musicTracks.length > 1);
            
            this.currentTrackIndex = randomIndex;
            this.saveMusicSettings();
        }
        
        return this.musicTracks[this.currentTrackIndex] || this.musicTracks[0];
    }
    
    async saveMusicSettings() {
        await this.setStoredSetting('musicSettings', {
            selectedTrack: this.currentTrackIndex,
            randomMode: this.randomMode
        });
    }
    
    async changeTrack(trackIndex) {
        console.log(`🎵 Mudando para track: ${trackIndex}`);
        
        if (trackIndex >= 0 && trackIndex < this.musicTracks.length) {
            this.currentTrackIndex = trackIndex;
            await this.saveMusicSettings();
            
            // Se estiver tocando, troca a música
            if (this.isPlaying && this.audioElement) {
                const wasPlaying = !this.audioElement.paused;
                const currentTime = this.audioElement.currentTime;
                const currentVolume = this.audioElement.volume;
                
                // Remove áudio atual
                this.removeAudioElement();
                
                // Cria novo áudio
                await this.createAudioPlayer({ 
                    currentTime: 0, // Começa do início na nova música
                    volume: currentVolume 
                });
                
                if (wasPlaying) {
                    await this.tryAutoplay();
                }
                
                // Atualiza controles
                this.updateMusicControls();
            }
        }
    }
    
    async toggleRandomMode() {
        this.randomMode = !this.randomMode;
        await this.saveMusicSettings();
        
        console.log(`🔀 Modo aleatório: ${this.randomMode ? 'ATIVADO' : 'DESATIVADO'}`);
        
        // Atualiza controles se existirem
        this.updateMusicControls();
    }
    
    nextTrack() {
        if (this.randomMode) {
            // No modo aleatório, getCurrentTrack() já seleciona aleatoriamente
            this.getCurrentTrack();
        } else {
            // Modo sequencial
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.musicTracks.length;
        }
        
        this.changeTrack(this.currentTrackIndex);
    }
    
    previousTrack() {
        if (!this.randomMode) {
            this.currentTrackIndex = (this.currentTrackIndex - 1 + this.musicTracks.length) % this.musicTracks.length;
            this.changeTrack(this.currentTrackIndex);
        } else {
            // No modo aleatório, "anterior" é uma música aleatória
            this.nextTrack();
        }
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'restoreMusic':
                    this.restoreMusic(request.musicState);
                    break;
                case 'startNewMusic':
                    this.startNewMusic();
                    break;
                case 'stopMusic':
                    this.stopMusic();
                    break;
                case 'toggleMusic':
                    if (request.enabled && !this.isPlaying) {
                        this.startNewMusic();
                    } else if (!request.enabled && this.isPlaying) {
                        this.toggleMusic();
                    }
                    break;
                case 'updateVolume':
                    if (this.audioElement) {
                        this.audioElement.volume = request.volume;
                        this.notifyBackgroundStateChange({ volume: request.volume });
                    }
                    break;
                case 'changeTrack':
                    this.changeTrack(request.trackIndex);
                    break;
                case 'toggleRandom':
                    this.toggleRandomMode();
                    break;
                case 'nextTrack':
                    this.nextTrack();
                    break;
                case 'previousTrack':
                    this.previousTrack();
                    break;
                case 'getMusicInfo':
                    sendResponse({
                        status: 'ok',
                        tracks: this.musicTracks,
                        currentTrack: this.currentTrackIndex,
                        randomMode: this.randomMode,
                        isPlaying: this.isPlaying
                    });
                    return true; // Indica resposta assíncrona
                case 'testMusic':
                    this.showMusicInfo();
                    break;
            }
            sendResponse({ status: 'ok' });
        });
    }

    async sendToBackground(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, (response) => {
                resolve(response || {});
            });
        });
    }

    async notifyBackgroundStateChange(stateChanges) {
        await this.sendToBackground({
            action: 'updateMusicState',
            state: stateChanges
        });
    }

    async startNewMusic() {
        try {
            console.log(`🎵 Iniciando nova música [${this.instanceId}]...`);
            
            // Remove qualquer áudio órfão primeiro
            this.cleanupOrphanAudios();
            
            // Cria elemento de áudio para tocar a música
            await this.createAudioPlayer();
            
            // ⚡ Adiciona controles visuais em paralelo - não bloqueia música
            this.addMusicControls();

            // Atualiza estado global
            const globalState = await this.getGlobalState();
            await this.setGlobalState({
                ...globalState,
                hasAudio: true,
                isPlaying: this.isPlaying
            });

            // Notifica o background script
            await this.sendToBackground({
                action: 'musicStarted',
                domain: this.currentDomain,
                currentTime: 0,
                volume: this.audioElement.volume
            });

            console.log(`🎵 Shopping Music Player ativado [${this.instanceId}]!`);
        } catch (error) {
            console.error(`Erro ao iniciar música [${this.instanceId}]:`, error);
        }
    }

    cleanupOrphanAudios() {
        // Remove todos os áudios órfãos de instâncias anteriores
        const orphanAudios = document.querySelectorAll('audio[data-shopping-music="true"]');
        orphanAudios.forEach(audio => {
            console.log(`🧹 Removendo áudio órfão`);
            audio.pause();
            audio.src = '';
            if (audio.parentNode) {
                audio.remove();
            }
        });
    }

    async createAudioPlayer(restoreState = null) {
        // Carrega configurações de música
        await this.loadMusicSettings();
        
        // Seleciona a música atual
        const currentTrack = this.getCurrentTrack();
        const audioUrl = chrome.runtime.getURL(currentTrack.file);
        console.log(`🎵 Criando novo áudio [${this.instanceId}]: ${currentTrack.name} (${audioUrl})`);
        
        this.audioElement = new Audio(audioUrl);
        
        // Marca este áudio como sendo do shopping music player
        this.audioElement.setAttribute('data-shopping-music', 'true');
        this.audioElement.setAttribute('data-instance-id', this.instanceId);
        this.audioElement.setAttribute('data-timestamp', Date.now());
        
        // ⚡ OTIMIZAÇÃO: Configura áudio antes de anexar ao DOM
        this.audioElement.style.display = 'none';
        this.audioElement.style.position = 'fixed';
        this.audioElement.style.top = '-9999px';
        
        // Previne remoção acidental do áudio
        this.audioElement.addEventListener('remove', (e) => {
            e.preventDefault();
            console.log(`🛡️ Tentativa de remoção do áudio bloqueada [${this.instanceId}]`);
        });
        
        // ⚡ COMEÇA CARREGAMENTO ANTES DO DOM (OTIMIZAÇÃO CRÍTICA)
        console.log(`⚡ Iniciando pré-carregamento do áudio [${this.instanceId}]...`);
        const audioLoadPromise = new Promise((resolve, reject) => {
            this.audioElement.addEventListener('canplaythrough', () => {
                console.log(`✅ Áudio pré-carregado [${this.instanceId}]`);
                resolve();
            });
            
            this.audioElement.addEventListener('error', (e) => {
                console.error(`❌ Erro ao carregar áudio [${this.instanceId}]:`, e);
                reject(new Error('Falha ao carregar arquivo de áudio'));
            });
            
            // Timeout de 10 segundos
            setTimeout(() => {
                reject(new Error('Timeout ao carregar áudio'));
            }, 10000);
        });
        
        // ⚡ INICIA CARREGAMENTO IMEDIATAMENTE (SEM ESPERAR DOM)
        console.log(`🚀 Carregando áudio sem esperar DOM [${this.instanceId}]...`);
        this.audioElement.preload = 'auto';
        this.audioElement.load();
        
        // ⚡ TENTA TOCAR IMEDIATAMENTE ASSIM QUE CARREGAR
        audioLoadPromise.then(async () => {
            console.log(`🎵 Tentando autoplay imediato [${this.instanceId}]`);
            await this.tryAutoplay();
        }).catch(error => {
            console.error(`❌ Erro no autoplay imediato [${this.instanceId}]:`, error);
        });
        
        // Aguarda DOM apenas para anexar elemento (em paralelo)
        const domReadyPromise = this.ensureDOMReady().then(() => {
            console.log(`📋 DOM pronto, anexando áudio [${this.instanceId}]`);
            document.documentElement.appendChild(this.audioElement);
        });
        
        // Aguarda carregamento completar (pode ser antes ou depois do DOM)
        await audioLoadPromise;
        
        // Configurações do áudio
        this.audioElement.loop = true;
        this.audioElement.volume = restoreState ? restoreState.volume : 0.3;
        
        // Restaura posição se fornecida
        if (restoreState && restoreState.currentTime) {
            this.audioElement.currentTime = restoreState.currentTime;
        }
        
        // Adiciona proteção contra pausa em navegação
        this.setupNavigationProtection();
        
        // ⚡ AUTOPLAY JÁ FOI TENTADO NO CARREGAMENTO - apenas finalizações aqui
        if (!this.isPlaying) {
            console.log(`🔄 Backup autoplay [${this.instanceId}]`);
            await this.tryAutoplay();
        } else {
            console.log(`✅ Autoplay já funcionou durante carregamento [${this.instanceId}]`);
        }
    }

    async tryAutoplay() {
        if (this.isPlaying) {
            console.log(`⚠️ Áudio já está tocando [${this.instanceId}]`);
            return;
        }
        
        console.log(`🎵 Tentando autoplay [${this.instanceId}]`);
        
        try {
            await this.audioElement.play();
            this.isPlaying = true;
            this.setupTimeUpdateListener();
            
            // 🔄 Inicia auto-save de continuidade
            this.startAutoSaveContinuity();
            
            // Atualiza estado global
            const globalState = await this.getGlobalState();
            await this.setGlobalState({
                ...globalState,
                isPlaying: true,
                hasAudio: true
            });
            
            console.log(`✅ Autoplay bem-sucedido [${this.instanceId}]!`);
            
        } catch (error) {
            console.log(`❌ Autoplay falhou [${this.instanceId}]:`, error.message);
            await this.handleAutoplayFailure();
        }
    }

    async handleAutoplayFailure() {
        // Verifica se o usuário quer notificações
        const showNotifications = await this.getStoredSetting('showPlayNotifications', true);
        
        if (showNotifications) {
            console.log(`📢 Mostrando notificação [${this.instanceId}]`);
            this.showDiscretePlayNotification();
        } else {
            console.log(`🔇 Notificações desabilitadas [${this.instanceId}]`);
        }
    }

    setupNavigationProtection() {
        if (!this.audioElement) return;

        console.log(`🛡️ Configurando proteção de navegação genérica [${this.instanceId}]`);
        
        // Intercepta cliques em links para preservar música
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && this.isPlaying) {
                console.log(`🔗 Link clicado, preservando música: ${link.href}`);
                
                // 🔄 Salva continuidade musical
                this.saveMusicContinuity();
                
                // Salva estado atual no storage para preservar entre navegações
                this.saveNavigationState();
            }
        }, true);
        
        // 🔄 DETECÇÃO GENÉRICA DE MUDANÇA DE URL (SPA Universal)
        this.setupGenericSPADetection();
        
        // Intercepta evento popstate (botão voltar/avançar)
        window.addEventListener('popstate', () => {
            console.log(`⬅️ Navegação via histórico detectada`);
            setTimeout(() => {
                this.handleSPANavigation();
            }, 300);
        });
        
        // Intercepta pushState e replaceState
        this.interceptHistoryAPI();
        
        // Monitora foco da janela para reativar música
        this.setupFocusMonitoring();
    }

    setupGenericSPADetection() {
        console.log(`🌐 Configurando detecção genérica de SPA [${this.instanceId}]`);
        
        let lastUrl = location.href;
        
        // Monitor simples de mudança de URL - funciona para qualquer SPA
        const urlPolling = setInterval(() => {
            if (location.href !== lastUrl && this.isPlaying) {
                const oldUrl = lastUrl;
                lastUrl = location.href;
                
                console.log(`🔄 Navegação SPA detectada: ${oldUrl} → ${location.href}`);
                this.handleSPANavigation();
            }
        }, 1000); // Verifica a cada segundo
        
        // Cleanup quando instância é destruída
        this.navigationCleanup = () => {
            clearInterval(urlPolling);
        };
    }

    handleSPANavigation() {
        console.log(`🔄 Processando navegação SPA`);
        
        // Verifica se ainda está em site de compras
        if (!isShoppingSite()) {
            console.log(`🏪 Saiu do site de compras, pausando música`);
            this.intentionalPause = true;
            if (this.audioElement) {
                this.audioElement.pause();
            }
            return;
        }

        // Salva estado atual
        this.saveMusicContinuity();
        this.saveNavigationState();

        // Agenda verificação de continuidade
        setTimeout(() => {
            this.ensureMusicContinuity();
        }, 300);

        // Aguarda estabilização e verifica continuidade musical
        setTimeout(() => {
            this.ensureMusicContinuity();
        }, 1000);
    }

    async ensureMusicContinuity() {
        if (!this.isInitialized) {
            console.log(`⚠️ Instância não inicializada, ignorando verificação`);
            return;
        }

        console.log(`🔍 Verificando continuidade musical [${this.instanceId}]`);

        // Verifica se ainda é a instância ativa
        const globalState = await this.getGlobalState();
        if (!globalState || globalState.instanceId !== this.instanceId) {
            console.log(`❌ Não é mais a instância ativa, abortando verificação`);
            return;
        }

        // Verifica se áudio ainda existe e está funcionando
        if (!this.audioElement || !document.documentElement.contains(this.audioElement)) {
            console.log(`⚠️ Elemento de áudio perdido, recriando...`);
            await this.recreateAudioFromContinuity();
            return;
        }

        // Verifica se música deveria estar tocando mas não está
        if (this.isPlaying && this.audioElement.paused) {
            console.log(`▶️ Música deveria estar tocando, retomando...`);
            try {
                await this.audioElement.play();
                console.log(`✅ Música retomada com sucesso`);
            } catch (error) {
                console.error(`❌ Erro ao retomar música:`, error);
                await this.recreateAudioFromContinuity();
            }
        }

        // Verifica se controles ainda existem
        if (this.isPlaying && !document.getElementById('shopping-music-controls')) {
            console.log(`🎛️ Controles perdidos, re-adicionando...`);
            this.addMusicControls(); // ⚡ Sem await - paralelo
        }

        // Atualiza controles existentes
        this.updateMusicControls();
    }

    async recreateAudioFromContinuity() {
        console.log(`🔄 Recriando áudio a partir de continuidade [${this.instanceId}]`);
        
        try {
            // Carrega estado de continuidade
            const continuityData = await this.loadMusicContinuity();
            
            if (continuityData && continuityData.isPlaying) {
                console.log(`📂 Continuidade encontrada, recriando áudio...`);
                
                // Para auto-save atual
                this.stopAutoSaveContinuity();
                
                // Remove áudio antigo se existir
                if (this.audioElement) {
                    this.removeAudioElement();
                }
                
                // Recria com estado de continuidade
                await this.restoreFromContinuity(continuityData);
                
                console.log(`✅ Áudio recriado com sucesso a partir de continuidade`);
            } else {
                console.log(`❌ Sem continuidade disponível para recriar, iniciando nova música`);
                await this.startNewMusic();
            }
        } catch (error) {
            console.error(`❌ Erro ao recriar áudio:`, error);
            // Fallback: tenta criar áudio novo
            try {
                await this.startNewMusic();
            } catch (fallbackError) {
                console.error(`❌ Erro no fallback:`, fallbackError);
            }
        }
    }

    async saveNavigationState() {
        if (!this.audioElement) return;
        
        const navigationState = {
            isPlaying: this.isPlaying,
            currentTime: this.audioElement.currentTime,
            volume: this.audioElement.volume,
            instanceId: this.instanceId,
            url: location.href,
            timestamp: Date.now()
        };
        
        await chrome.storage.local.set({ 
            'navigation_music_state': navigationState 
        });
        
        console.log(`💾 Estado de navegação salvo:`, navigationState);
    }

    async restoreAfterNavigation() {
        try {
            const result = await chrome.storage.local.get(['navigation_music_state']);
            const savedState = result.navigation_music_state;
            
            if (savedState && (Date.now() - savedState.timestamp) < 10000) {
                console.log(`🔄 Restaurando estado após navegação:`, savedState);
                
                if (this.audioElement && savedState.isPlaying) {
                    this.audioElement.currentTime = savedState.currentTime;
                    this.audioElement.volume = savedState.volume;
                    
                    if (this.audioElement.paused) {
                        await this.audioElement.play();
                        this.isPlaying = true;
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao restaurar após navegação:', error);
        }
    }



    setupFocusMonitoring() {
        // Monitora quando a janela ganha foco
        window.addEventListener('focus', () => {
            console.log(`🔍 Janela ganhou foco, verificando música`);
            setTimeout(() => {
                this.ensureMusicContinuity();
            }, 100);
        });
        
        // Monitora visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log(`👁️ Página ficou visível, verificando música`);
                setTimeout(() => {
                    this.ensureMusicContinuity();
                }, 200);
            }
        });
    }

    ensureMusicContinuity() {
        if (!this.isPlaying || !this.audioElement) return;
        
        console.log(`🔍 Verificando continuidade da música...`);
        
        // Verifica se áudio ainda existe no DOM
        if (!document.documentElement.contains(this.audioElement)) {
            console.log(`⚠️ Elemento de áudio foi removido do DOM, recriando...`);
            this.recreateAudioElement();
            return;
        }
        
        // Verifica se áudio está pausado quando deveria estar tocando
        if (this.audioElement.paused && !this.intentionalPause) {
            console.log(`▶️ Áudio pausado inesperadamente, retomando...`);
            this.audioElement.play().catch(error => {
                console.error('Erro ao retomar áudio:', error);
                // Se falhar, tenta recriar
                this.recreateAudioElement();
            });
        }
        
        // Verifica se controles ainda estão visíveis
        if (!document.getElementById('shopping-music-controls')) {
            console.log(`🎛️ Controles não encontrados, re-adicionando...`);
            this.controlsAdded = false;
            this.addMusicControls();
        }
        
        // Atualiza estado global
        this.updateGlobalStateQuietly();
    }

    async recreateAudioElement() {
        console.log(`🔄 Recriando elemento de áudio [${this.instanceId}]...`);
        
        const currentTime = this.audioElement ? this.audioElement.currentTime : 0;
        const currentVolume = this.audioElement ? this.audioElement.volume : 0.3;
        
        // Remove elemento antigo se existir
        if (this.audioElement) {
            this.removeAudioElement();
        }
        
        // Recria com estado preservado
        await this.createAudioPlayer({
            currentTime: currentTime,
            volume: currentVolume
        });
    }

    async updateGlobalStateQuietly() {
        try {
            const globalState = await this.getGlobalState();
            if (globalState && globalState.instanceId === this.instanceId) {
                await this.setGlobalState({
                    ...globalState,
                    isPlaying: this.isPlaying,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.log('Erro ao atualizar estado global:', error);
        }
    }

    interceptHistoryAPI() {
        // Intercepta pushState
        const originalPushState = history.pushState;
        history.pushState = (...args) => {
            console.log(`📌 pushState interceptado: ${args[2] || 'sem URL'}`);
            this.saveNavigationState();
            const result = originalPushState.apply(history, args);
            setTimeout(() => {
                this.handleSPANavigation();
            }, 300);
            return result;
        };

        // Intercepta replaceState  
        const originalReplaceState = history.replaceState;
        history.replaceState = (...args) => {
            console.log(`🔄 replaceState interceptado: ${args[2] || 'sem URL'}`);
            this.saveNavigationState();
            const result = originalReplaceState.apply(history, args);
            setTimeout(() => {
                this.handleSPANavigation();
            }, 300);
            return result;
        };
    }

    setupTimeUpdateListener() {
        if (!this.audioElement) return;
        
        // Remove listeners existentes para evitar duplicatas
        this.audioElement.removeEventListener('timeupdate', this.timeUpdateHandler);
        
        // Cria novo handler
        this.timeUpdateHandler = () => {
            if (this.isPlaying && this.audioElement && this.audioElement.currentTime % 5 < 0.1) {
                // Atualiza background a cada 5 segundos
                this.notifyBackgroundStateChange({
                    currentTime: this.audioElement.currentTime
                });
            }
        };
        
        this.audioElement.addEventListener('timeupdate', this.timeUpdateHandler);
        
        // Adiciona listener para detectar pausas não intencionais
        this.audioElement.addEventListener('pause', () => {
            if (this.isPlaying && !this.intentionalPause) {
                console.log(`⚠️ Pausa não intencional detectada, retomando em 100ms`);
                setTimeout(() => {
                    if (this.audioElement && this.isPlaying) {
                        this.audioElement.play().catch(console.error);
                    }
                }, 100);
            }
        });
        
        // Adiciona listener para detectar final inesperado
        this.audioElement.addEventListener('ended', () => {
            if (this.audioElement.loop && this.isPlaying) {
                console.log(`🔄 Áudio terminou inesperadamente, reiniciando`);
                this.audioElement.play().catch(console.error);
            }
        });
    }

    showDiscretePlayNotification() {
        // Remove notificação existente se houver
        const existingNotification = document.getElementById('music-play-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Notificação pequena e discreta no canto
        const notification = document.createElement('div');
        notification.id = 'music-play-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            background: rgba(255, 107, 107, 0.95);
            color: white;
            padding: 12px 18px;
            border-radius: 25px;
            font-family: Arial, sans-serif;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            user-select: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 8px;
            max-width: 280px;
        `;

        notification.innerHTML = `
            <span style="font-size: 16px;">🎵</span>
            <span>Clique para ativar música de compras</span>
            <span style="font-size: 12px; opacity: 0.8; margin-left: 5px;">✕</span>
        `;

        document.body.appendChild(notification);

        // Auto-remove após 8 segundos
        const autoRemove = setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(10px)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 8000);

        // Clique para ativar música
        notification.addEventListener('click', async () => {
            try {
                await this.audioElement.play();
                this.isPlaying = true;
                notification.remove();
                clearTimeout(autoRemove);
                
                // Atualiza estado global
                const globalState = await this.getGlobalState();
                await this.setGlobalState({
                    ...globalState,
                    isPlaying: true
                });
                
                // Notifica background
                await this.sendToBackground({
                    action: 'musicStarted',
                    domain: this.currentDomain,
                    currentTime: this.audioElement.currentTime,
                    volume: this.audioElement.volume
                });
                
                console.log(`🎵 Música ativada pelo usuário [${this.instanceId}]!`);
            } catch (error) {
                console.error('Erro ao tocar música:', error);
            }
        });

        // Animação de entrada
        setTimeout(() => {
            notification.style.transform = 'translateY(-5px)';
        }, 100);
    }

    async addMusicControls() {
        // Evita adicionar controles duplicados
        if (this.controlsAdded || document.getElementById('shopping-music-controls')) {
            return;
        }

        // ⚡ OTIMIZAÇÃO: Controles em paralelo - não bloqueia música
        this.addControlsAsync();
    }

    async addControlsAsync() {
        try {
            // Aguarda DOM estar pronto (em paralelo, não bloqueia música)
            await this.ensureDOMReady();
            
            // Verifica novamente após aguardar DOM (pode ter sido criado por outra instância)
            if (document.getElementById('shopping-music-controls')) {
                return;
            }

        // Cria um player expandido com controles avançados
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'shopping-music-controls';
        controlsContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 999999;
            background: linear-gradient(45deg, #ff6b6b, #feca57);
            color: white;
            padding: 12px 16px;
            border-radius: 25px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            cursor: pointer;
            user-select: none;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 200px;
        `;

        // Ícone de música
        const musicIcon = document.createElement('span');
        musicIcon.textContent = this.randomMode ? '🔀' : '🎵';
        musicIcon.style.fontSize = '16px';
        musicIcon.id = 'music-mode-icon';

        // Nome da música atual
        const trackName = document.createElement('span');
        const currentTrack = this.getCurrentTrack();
        trackName.textContent = currentTrack.name;
        trackName.id = 'track-name';
        trackName.style.cssText = `
            flex: 1;
            font-size: 11px;
            opacity: 0.9;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        `;

        // Controles de navegação
        const prevButton = document.createElement('button');
        prevButton.textContent = '⏮️';
        prevButton.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 12px;
            padding: 2px;
            opacity: 0.8;
        `;
        prevButton.title = 'Música anterior';

        const toggleButton = document.createElement('button');
        toggleButton.textContent = this.isPlaying ? '⏸️' : '▶️';
        toggleButton.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 14px;
            padding: 2px;
        `;
        toggleButton.title = 'Play/Pause';
        toggleButton.id = 'play-pause-btn';

        const nextButton = document.createElement('button');
        nextButton.textContent = '⏭️';
        nextButton.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 12px;
            padding: 2px;
            opacity: 0.8;
        `;
        nextButton.title = 'Próxima música';

        // Monta os controles
        controlsContainer.appendChild(musicIcon);
        controlsContainer.appendChild(trackName);
        controlsContainer.appendChild(prevButton);
        controlsContainer.appendChild(toggleButton);
        controlsContainer.appendChild(nextButton);

        // Eventos
        prevButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.previousTrack();
        });

        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMusic();
        });

        nextButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.nextTrack();
        });

        // Clique no ícone alterna modo aleatório
        musicIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleRandomMode();
        });

        // Clique no container mostra info
        controlsContainer.addEventListener('click', (e) => {
            if (e.target === controlsContainer || e.target === trackName) {
                this.showMusicInfo();
            }
        });

        // Adiciona ao DOM
        document.body.appendChild(controlsContainer);
        this.controlsAdded = true;

        // Auto-hide após alguns segundos
        setTimeout(() => {
            if (controlsContainer.parentNode) {
                controlsContainer.style.opacity = '0.7';
                controlsContainer.style.transform = 'translateX(10px)';
            }
        }, 5000);

        // Mostra novamente ao passar o mouse
        controlsContainer.addEventListener('mouseenter', () => {
            controlsContainer.style.opacity = '1';
            controlsContainer.style.transform = 'translateX(0px)';
        });
        
        } catch (error) {
            console.error(`❌ Erro ao adicionar controles [${this.instanceId}]:`, error);
        }
    }

    updateMusicControls() {
        const trackName = document.getElementById('track-name');
        const modeIcon = document.getElementById('music-mode-icon');
        const playButton = document.getElementById('play-pause-btn');
        
        if (trackName) {
            const currentTrack = this.getCurrentTrack();
            trackName.textContent = currentTrack.name;
        }
        
        if (modeIcon) {
            modeIcon.textContent = this.randomMode ? '🔀' : '🎵';
        }
        
        if (playButton) {
            playButton.textContent = this.isPlaying ? '⏸️' : '▶️';
        }
    }

    async toggleMusic() {
        if (!this.audioElement) return;

        if (this.isPlaying) {
            // 🔄 Salva continuidade antes de pausar
            await this.saveMusicContinuity();
            
            // Marca como pausa intencional
            this.intentionalPause = true;
            this.audioElement.pause();
            this.isPlaying = false;
            
            // Para auto-save quando pausado
            this.stopAutoSaveContinuity();
            
            const button = document.querySelector('#shopping-music-controls button');
            if (button) button.textContent = '▶️';
            
            // Atualiza estado global
            const globalState = await this.getGlobalState();
            await this.setGlobalState({
                ...globalState,
                isPlaying: false
            });
            
            // Notifica background que parou
            this.sendToBackground({ action: 'musicStopped' });
            
            console.log(`⏸️ Música pausada intencionalmente [${this.instanceId}]`);
        } else {
            this.intentionalPause = false;
            
            this.audioElement.play().then(async () => {
                this.isPlaying = true;
                
                // 🔄 Reinicia auto-save quando retoma
                this.startAutoSaveContinuity();
                
                const button = document.querySelector('#shopping-music-controls button');
                if (button) button.textContent = '⏸️';
                
                // Atualiza estado global
                const globalState = await this.getGlobalState();
                await this.setGlobalState({
                    ...globalState,
                    isPlaying: true
                });
                
                // Notifica background que começou
                this.sendToBackground({
                    action: 'musicStarted',
                    domain: this.currentDomain,
                    currentTime: this.audioElement.currentTime,
                    volume: this.audioElement.volume
                });
                
                console.log(`▶️ Música retomada [${this.instanceId}]`);
            }).catch(error => {
                console.error('Erro ao reproduzir música:', error);
            });
        }
    }

    showMusicInfo() {
        const currentTrack = this.getCurrentTrack();
        const trackList = this.musicTracks.map((track, index) => 
            `${index === this.currentTrackIndex ? '▶️' : '🎵'} ${track.name}`
        ).join('\n');

        alert(`🎵 Shopping Music Player

Música atual: ${currentTrack.name}
Modo: ${this.randomMode ? 'Aleatório 🔀' : 'Sequencial 🎵'}
Status: ${this.isPlaying ? 'Tocando ▶️' : 'Pausado ⏸️'}

Músicas disponíveis:
${trackList}

Site atual: ${window.location.hostname}
Instância: ${this.instanceId}

💡 Controles:
• Clique no ícone 🎵/🔀 para alternar modo aleatório
• Use ⏮️ e ⏭️ para navegar entre músicas
• Configure mais opções no popup da extensão`);
    }

    async getStoredSetting(key, defaultValue) {
        return new Promise((resolve) => {
            chrome.storage.sync.get([key], (result) => {
                resolve(result[key] !== undefined ? result[key] : defaultValue);
            });
        });
    }

    async setStoredSetting(key, value) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ [key]: value }, resolve);
        });
    }

    async stopMusic() {
        if (this.audioElement && this.isPlaying) {
            console.log(`🛑 Parando música [${this.instanceId}]`);
            this.audioElement.pause();
            this.isPlaying = false;
            
            // Atualiza estado global
            const globalState = await this.getGlobalState();
            if (globalState && globalState.instanceId === this.instanceId) {
                await this.setGlobalState({
                    ...globalState,
                    isPlaying: false
                });
            }
            
            // Remove controles visuais
            const controls = document.getElementById('shopping-music-controls');
            if (controls) {
                controls.remove();
                this.controlsAdded = false;
            }
            
            console.log(`🎵 Música parada [${this.instanceId}]`);
        }
    }

    async destroy() {
        // Destrói completamente a instância
        console.log(`🗑️ Destruindo instância [${this.instanceId}]`);
        
        // 🔄 Salva continuidade antes de destruir (se estava tocando)
        if (this.isPlaying && this.audioElement) {
            await this.saveMusicContinuity();
        }
        
        this.stopMusic();
        
        // Para auto-save de continuidade
        this.stopAutoSaveContinuity();
        
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }

        // 🛒 Limpa recursos de navegação Amazon
        if (this.navigationCleanup) {
            this.navigationCleanup();
            this.navigationCleanup = null;
        }
        
        // Remove da instância global se for esta
        const globalState = await this.getGlobalState();
        if (globalState && globalState.instanceId === this.instanceId) {
            await this.clearGlobalState();
        }
        
        this.removeAudioElement();
        this.isInitialized = false;
    }
}

// Função para verificar se é site de compras
function isShoppingSite() {
    const shoppingSites = [
        'mercadolivre.com.br', 'mercadolibre.com', 'amazon.com', 'amazon.com.br',
        'ebay.com', 'aliexpress.com', 'shopee.com.br', 'americanas.com.br',
        'submarino.com.br', 'casasbahia.com.br', 'magazineluiza.com.br'
    ];

    const currentSite = window.location.hostname.toLowerCase();
    return shoppingSites.some(site => 
        currentSite.includes(site) || currentSite.endsWith(site)
    );
}

// Inicialização principal com suporte aprimorado para SPAs
if (isShoppingSite()) {
    const currentSite = window.location.hostname;
    console.log(`🛒 Site de compras detectado: ${currentSite}`);
    
    // Função robusta de inicialização
    const initializePlayer = () => {
        // Verifica se já existe player ativo e funcional
        if (window.shoppingMusicPlayer && 
            window.shoppingMusicPlayer.isInitialized && 
            window.shoppingMusicPlayer.audioElement &&
            document.documentElement.contains(window.shoppingMusicPlayer.audioElement)) {
            console.log(`⚠️ Player já existe e funcional, verificando continuidade`);
            window.shoppingMusicPlayer.ensureMusicContinuity();
            return;
        }
        
        // Remove player antigo se existir mas não funcional
        if (window.shoppingMusicPlayer) {
            console.log(`🧹 Removendo player antigo não funcional`);
            try {
                window.shoppingMusicPlayer.destroy();
            } catch (e) {
                console.log('Erro ao destruir player antigo:', e);
            }
        }
        
        // Inicializa novo player
        console.log(`🆕 Criando novo Shopping Music Player`);
        const player = new ShoppingMusicPlayer();
        
        // Mantém referência global para debug e limpeza
        window.shoppingMusicPlayer = player;
        
        // Cleanup quando sair da página
        window.addEventListener('beforeunload', (e) => {
            if (player && player.isInitialized) {
                // 🔄 Salva continuidade musical antes de sair
                if (player.isPlaying && player.audioElement) {
                    player.saveMusicContinuity();
                }
                
                // Salva estado antes de sair
                player.saveNavigationState();
                console.log(`🚪 Página sendo fechada, continuidade e estado salvos`);
            }
        });
        
        // Gerencia visibilidade da página (mudança de aba)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && player && player.isInitialized) {
                // 🔄 Salva continuidade quando oculta aba
                if (player.isPlaying && player.audioElement) {
                    player.saveMusicContinuity();
                }
                
                // Salva estado quando oculta
                player.saveNavigationState();
                console.log(`👁️ Página oculta, continuidade e estado salvos [${player.instanceId}]`);
            } else if (!document.hidden && player && player.isInitialized) {
                // Restaura quando volta
                setTimeout(() => {
                    player.restoreAfterNavigation();
                    player.ensureMusicContinuity();
                }, 200);
                console.log(`👁️ Página visível, restaurando estado [${player.instanceId}]`);
            }
        });
        
        // 🌐 Monitoramento genérico para qualquer SPA
        console.log(`🌐 Configurando monitoramento genérico de SPA`);
        
        let currentUrl = location.href;
        
        const genericMonitor = setInterval(() => {
            // Verifica mudança de URL apenas se música está tocando
            if (location.href !== currentUrl && player && player.isInitialized && player.isPlaying) {
                currentUrl = location.href;
                console.log(`🔄 URL mudou para: ${currentUrl}`);
                
                if (isShoppingSite()) {
                    setTimeout(() => {
                        player.ensureMusicContinuity();
                    }, 1000);
                } else {
                    console.log(`🏪 Saiu do site de compras`);
                    player.intentionalPause = true;
                    if (player.audioElement) {
                        player.audioElement.pause();
                    }
                }
            }
        }, 1000); // Verifica a cada segundo
    };
    
    // ⚡ OTIMIZAÇÃO: Estratégia de inicialização IMEDIATA
    const tryInitialize = () => {
        console.log(`🚀 Inicialização IMEDIATA - não espera DOM [${Date.now()}]`);
        initializePlayer();
        
        // Backup: tenta novamente após 1 segundo se não funcionou
        setTimeout(() => {
            if (!window.shoppingMusicPlayer || !window.shoppingMusicPlayer.isInitialized) {
                console.log(`🔄 Backup: tentativa após 1 segundo`);
                initializePlayer();
            }
        }, 1000);
        
        // Último backup: tenta após 3 segundos
        setTimeout(() => {
            if (!window.shoppingMusicPlayer || !window.shoppingMusicPlayer.isInitialized) {
                console.log(`🔄 Último backup: tentativa após 3 segundos`);
                initializePlayer();
            }
        }, 3000);
    };
    
    // ⚡ EXECUÇÃO IMEDIATA - Não espera nada!
    console.log(`🚀 INICIANDO IMEDIATAMENTE - URL já disponível: ${window.location.href}`);
    tryInitialize();
    
    // Observer de mudanças no body (só quando DOM estiver pronto)
    const setupBodyObserver = () => {
        if (document.body) {
            console.log(`👁️ Configurando observer do body`);
            const bodyObserver = new MutationObserver((mutations) => {
                let significantChange = false;
                mutations.forEach(mutation => {
                    if (mutation.addedNodes.length > 5 || 
                        mutation.removedNodes.length > 5) {
                        significantChange = true;
                    }
                });
                
                if (significantChange) {
                    console.log(`🔄 Mudança significativa no DOM detectada`);
                    setTimeout(() => {
                        if (window.shoppingMusicPlayer && window.shoppingMusicPlayer.isInitialized) {
                            window.shoppingMusicPlayer.ensureMusicContinuity();
                        } else {
                            initializePlayer();
                        }
                    }, 1000);
                }
            });
            
            bodyObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            // Body ainda não existe, tenta novamente
            setTimeout(setupBodyObserver, 100);
        }
    };
    
    // Configura observer quando possível
    setupBodyObserver();
    
} else {
    console.log(`🏪 Site não é de compras: ${window.location.hostname}`);
}