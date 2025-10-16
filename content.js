// Shopping Music Player - Content Script
// Toca música quando o usuário entra em sites de compras

class ShoppingMusicPlayer {
    constructor() {
        this.audioElement = null;
        this.isPlaying = false;
        this.musicUrl = 'https://www.youtube.com/watch?v=3_soYT__b9U&list=PL49AC5D420FA55436&index=8';
        this.currentDomain = window.location.hostname;
        this.controlsAdded = false;
        this.instanceId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        this.globalKey = 'shopping_music_global_state';
        this.isInitialized = false;
        
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
        
        // Se existe uma instância ativa nos últimos 5 segundos, aborta
        if (existingState && existingState.isActive && (now - existingState.timestamp) < 5000) {
            console.log(`🎵 Instância ativa encontrada [${existingState.instanceId}], abortando [${this.instanceId}]`);
            return;
        }

        // Registra esta instância como ativa
        await this.setGlobalState({
            isActive: true,
            instanceId: this.instanceId,
            domain: this.currentDomain,
            isPlaying: false,
            timestamp: now,
            tabId: await this.getCurrentTabId()
        });

        this.isInitialized = true;
        
        // Aguarda o DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.checkAndStart());
        } else {
            setTimeout(() => this.checkAndStart(), 500);
        }

        // Escuta mensagens do background script
        this.setupMessageListener();
        
        // Monitora outras instâncias
        this.startInstanceMonitoring();
    }

    async getCurrentTabId() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            return tabs[0]?.id || null;
        } catch (error) {
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
            this.audioElement.pause();
            this.audioElement.src = '';
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

            // Procura por áudio existente global
            const existingAudio = this.findExistingAudio();
            if (existingAudio) {
                console.log(`🎵 Reutilizando áudio existente [${this.instanceId}]`);
                this.audioElement = existingAudio;
                this.isPlaying = !existingAudio.paused;
                
                if (this.isPlaying) {
                    this.setupTimeUpdateListener();
                }
                
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
            
            // Adiciona controles visuais
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
        // Usando o arquivo de música personalizado do usuário
        const audioUrl = chrome.runtime.getURL('audio/shop-1.mp3');
        console.log(`🎵 Criando novo áudio [${this.instanceId}]:`, audioUrl);
        
        this.audioElement = new Audio(audioUrl);
        
        // Marca este áudio como sendo do shopping music player
        this.audioElement.setAttribute('data-shopping-music', 'true');
        this.audioElement.setAttribute('data-instance-id', this.instanceId);
        this.audioElement.setAttribute('data-timestamp', Date.now());
        
        // Adiciona ao DOM para persistir
        this.audioElement.style.display = 'none';
        document.body.appendChild(this.audioElement);
        
        // Aguarda o carregamento do áudio
        await new Promise((resolve, reject) => {
            this.audioElement.addEventListener('canplaythrough', () => {
                console.log(`✅ Áudio carregado [${this.instanceId}]`);
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
        
        // Configurações do áudio
        this.audioElement.loop = true;
        this.audioElement.volume = restoreState ? restoreState.volume : 0.3;
        
        // Restaura posição se fornecida
        if (restoreState && restoreState.currentTime) {
            this.audioElement.currentTime = restoreState.currentTime;
        }
        
        // Tenta tocar
        await this.tryAutoplay();
    }

    async tryAutoplay() {
        console.log(`🎵 Tentando autoplay [${this.instanceId}]`);
        
        try {
            await this.audioElement.play();
            this.isPlaying = true;
            this.setupTimeUpdateListener();
            
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

    addMusicControls() {
        // Evita adicionar controles duplicados
        if (this.controlsAdded || document.getElementById('shopping-music-controls')) {
            return;
        }

        // Cria um pequeno player fixo no canto da tela
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'shopping-music-controls';
        controlsContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 999999;
            background: linear-gradient(45deg, #ff6b6b, #feca57);
            color: white;
            padding: 10px 15px;
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
        `;

        const musicIcon = document.createElement('span');
        musicIcon.textContent = '🎵';
        musicIcon.style.fontSize = '16px';

        const statusText = document.createElement('span');
        statusText.textContent = 'Shopping Music';
        statusText.id = 'music-status';

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

        controlsContainer.appendChild(musicIcon);
        controlsContainer.appendChild(statusText);
        controlsContainer.appendChild(toggleButton);

        // Eventos
        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMusic();
        });

        controlsContainer.addEventListener('click', () => {
            this.showMusicInfo();
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
    }

    async toggleMusic() {
        if (!this.audioElement) return;

        if (this.isPlaying) {
            this.audioElement.pause();
            this.isPlaying = false;
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
        } else {
            this.audioElement.play().then(async () => {
                this.isPlaying = true;
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
            }).catch(error => {
                console.error('Erro ao reproduzir música:', error);
            });
        }
    }

    showMusicInfo() {
        alert(`🎵 Shopping Music Player

Você está ouvindo uma música especial para suas compras online!

Site atual: ${window.location.hostname}
Status: ${this.isPlaying ? 'Tocando' : 'Pausado'}
Instância: ${this.instanceId}

💡 Dica: Use os controles para pausar/reproduzir a música.`);
    }

    async getStoredSetting(key, defaultValue) {
        return new Promise((resolve) => {
            chrome.storage.sync.get([key], (result) => {
                resolve(result[key] !== undefined ? result[key] : defaultValue);
            });
        });
    }

    setStoredSetting(key, value) {
        chrome.storage.sync.set({ [key]: value });
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
        
        this.stopMusic();
        
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
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

// Inicialização principal
if (isShoppingSite()) {
    const currentSite = window.location.hostname;
    console.log(`🛒 Site de compras detectado: ${currentSite}`);
    
    // Aguarda um pouco para garantir que a página carregou
    setTimeout(() => {
        // Inicializa o player
        const player = new ShoppingMusicPlayer();
        
        // Mantém referência global para debug e limpeza
        window.shoppingMusicPlayer = player;
        
        // Cleanup quando sair da página
        window.addEventListener('beforeunload', () => {
            if (player && player.isInitialized) {
                player.destroy();
            }
        });
        
        // Cleanup quando a página fica oculta (mudança de aba)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && player && player.isInitialized) {
                // Não destrói, apenas atualiza estado
                console.log(`👁️ Página oculta, mantendo instância [${player.instanceId}]`);
            }
        });
    }, 1000);
} else {
    console.log(`🏪 Site não é de compras: ${window.location.hostname}`);
}