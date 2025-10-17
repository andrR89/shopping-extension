// Popup Script para Shopping Music Player
document.addEventListener('DOMContentLoaded', function() {
    const musicToggle = document.getElementById('musicToggle');
    const notificationsToggle = document.getElementById('notificationsToggle');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const testMusicBtn = document.getElementById('testMusic');
    const aboutBtn = document.getElementById('aboutBtn');
    const feedbackBtn = document.getElementById('feedbackBtn');
    
    // Novos controles de música
    const randomToggle = document.getElementById('randomToggle');
    const currentTrackName = document.getElementById('currentTrackName');
    const trackSelector = document.getElementById('trackSelector');
    const prevTrackBtn = document.getElementById('prevTrack');
    const nextTrackBtn = document.getElementById('nextTrack');

    // Carrega configurações salvas
    loadSettings();
    
    // Carrega informações das músicas
    loadMusicInfo();

    // Event Listeners
    musicToggle.addEventListener('click', toggleMusic);
    notificationsToggle.addEventListener('click', toggleNotifications);
    volumeSlider.addEventListener('input', updateVolume);
    testMusicBtn.addEventListener('click', testMusic);
    aboutBtn.addEventListener('click', showAbout);
    feedbackBtn.addEventListener('click', showFeedback);
    
    // Novos event listeners
    randomToggle.addEventListener('click', toggleRandomMode);
    prevTrackBtn.addEventListener('click', previousTrack);
    nextTrackBtn.addEventListener('click', nextTrack);

    // Carrega as configurações do storage
    function loadSettings() {
        chrome.storage.sync.get(['musicEnabled', 'volume', 'showPlayNotifications'], function(result) {
            const isEnabled = result.musicEnabled !== undefined ? result.musicEnabled : true;
            const volume = result.volume !== undefined ? result.volume : 30;
            const showNotifications = result.showPlayNotifications !== undefined ? result.showPlayNotifications : true;

            // Atualiza toggles
            updateToggleState(musicToggle, isEnabled);
            updateToggleState(notificationsToggle, showNotifications);
            
            // Atualiza volume
            volumeSlider.value = volume;
            volumeValue.textContent = volume + '%';
        });
    }

    // Toggle da música
    function toggleMusic() {
        const isActive = musicToggle.classList.contains('active');
        const newState = !isActive;
        
        updateToggleState(musicToggle, newState);
        
        // Salva no storage
        chrome.storage.sync.set({ musicEnabled: newState });

        // Notifica content scripts
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'toggleMusic',
                    enabled: newState
                }).catch(() => {
                    // Ignora erros se não houver content script
                });
            }
        });
    }

    // Toggle das notificações
    function toggleNotifications() {
        const isActive = notificationsToggle.classList.contains('active');
        const newState = !isActive;
        
        updateToggleState(notificationsToggle, newState);
        
        // Salva no storage
        chrome.storage.sync.set({ showPlayNotifications: newState });
    }

    // Atualiza estado visual do toggle
    function updateToggleState(toggleElement, isEnabled) {
        if (isEnabled) {
            toggleElement.classList.add('active');
        } else {
            toggleElement.classList.remove('active');
        }
    }

    // Atualiza volume
    function updateVolume() {
        const volume = parseInt(volumeSlider.value);
        volumeValue.textContent = volume + '%';
        
        // Salva no storage
        chrome.storage.sync.set({ volume: volume });

        // Notifica content scripts
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'updateVolume',
                    volume: volume / 100
                }).catch(() => {
                    // Ignora erros se não houver content script
                });
            }
        });
    }

    // Testa a música
    function testMusic() {
        testMusicBtn.textContent = '🎵 Tocando...';
        testMusicBtn.disabled = true;

        // Simula teste por 3 segundos
        setTimeout(() => {
            testMusicBtn.textContent = '🎵 Testar Música';
            testMusicBtn.disabled = false;
        }, 3000);

        // Notifica content script para testar
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'testMusic'
                }).catch(() => {
                    console.log('Teste de música - content script não disponível na aba atual');
                });
            }
        });
    }

    // Mostra informações sobre a extensão
    function showAbout() {
        alert(`🎵 Shopping Music Player v1.0

Esta extensão toca automaticamente uma música especial quando você visita sites de compras online, tornando sua experiência de compras mais divertida!

✨ Funcionalidades:
• Detecção automática de sites de compras
• Controle de volume personalizável
• Ativar/desativar facilmente
• Interface amigável

🛒 Sites suportados:
• Mercado Livre
• Amazon
• eBay
• Shopee
• Americanas
• Magazine Luiza
• E muitos outros!

Desenvolvido com ❤️ para melhorar sua experiência online.`);
    }

    // Mostra formulário de feedback
    function showFeedback() {
        const feedback = prompt(`💬 Seu feedback é importante!

Como você classificaria a extensão? (1-5 estrelas)
Deixe também sugestões ou comentários:

(Digite sua avaliação e comentários abaixo)`);

        if (feedback && feedback.trim()) {
            // Em uma implementação real, você enviaria isso para um servidor
            alert(`Obrigado pelo seu feedback! 

"${feedback}"

Sua opinião nos ajuda a melhorar a extensão. 🙏`);
        }
    }

    // Verifica se está em um site de compras
    function checkCurrentSite() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                const url = tabs[0].url;
                const hostname = new URL(url).hostname.toLowerCase();
                
                const shoppingSites = {
                    'mercadolivre.com.br': 'statusML',
                    'amazon.com': 'statusAmazon',
                    'ebay.com': 'statusEbay',
                    'shopee.com.br': 'statusShopee',
                    'americanas.com.br': 'statusAmericanas',
                    'magazineluiza.com.br': 'statusMagalu'
                };

                // Reseta todos os status
                Object.values(shoppingSites).forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.className = 'status-indicator status-inactive';
                    }
                });

                // Marca o site atual como ativo
                for (const [site, statusId] of Object.entries(shoppingSites)) {
                    if (hostname.includes(site)) {
                        const element = document.getElementById(statusId);
                        if (element) {
                            element.className = 'status-indicator status-active';
                        }
                        break;
                    }
                }
            }
        });
    }

    // ========== FUNÇÕES DE CONTROLE DE MÚSICA ==========
    
    async function loadMusicInfo() {
        try {
            // Carrega configurações de música
            const result = await chrome.storage.sync.get(['musicSettings']);
            const settings = result.musicSettings || { selectedTrack: 0, randomMode: false };
            
            // Atualiza toggle do modo aleatório
            updateToggleState(randomToggle, settings.randomMode);
            
            // Solicita informações de música do content script
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'getMusicInfo' }, function(response) {
                        if (response && response.tracks) {
                            updateMusicDisplay(response);
                        } else {
                            // Fallback para informações padrão
                            updateMusicDisplay({
                                tracks: [
                                    { id: 'shop-1', name: 'Shopping Music 1' },
                                    { id: 'shop-2', name: 'Shopping Music 2' }
                                ],
                                currentTrack: settings.selectedTrack,
                                randomMode: settings.randomMode,
                                isPlaying: false
                            });
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Erro ao carregar informações de música:', error);
        }
    }
    
    function updateMusicDisplay(musicInfo) {
        const { tracks, currentTrack, randomMode, isPlaying } = musicInfo;
        
        // Atualiza nome da música atual
        if (tracks && tracks[currentTrack]) {
            currentTrackName.textContent = tracks[currentTrack].name;
        }
        
        // Atualiza modo aleatório
        updateToggleState(randomToggle, randomMode);
        
        // Cria botões de seleção de música
        trackSelector.innerHTML = '';
        
        if (tracks) {
            tracks.forEach((track, index) => {
                const trackButton = document.createElement('button');
                trackButton.className = 'track-button';
                trackButton.textContent = track.name;
                trackButton.dataset.trackIndex = index;
                
                if (index === currentTrack) {
                    trackButton.classList.add('active');
                }
                
                trackButton.addEventListener('click', () => selectTrack(index));
                trackSelector.appendChild(trackButton);
            });
        }
        
        // Adiciona informações adicionais
        const infoDiv = document.createElement('div');
        infoDiv.className = 'music-info';
        infoDiv.innerHTML = `
            <div>Modo: ${randomMode ? 'Aleatório 🔀' : 'Sequencial 🎵'}</div>
            <div>Status: ${isPlaying ? 'Tocando ▶️' : 'Pausado ⏸️'}</div>
        `;
        
        // Remove info anterior se existir
        const existingInfo = trackSelector.querySelector('.music-info');
        if (existingInfo) {
            existingInfo.remove();
        }
        
        trackSelector.appendChild(infoDiv);
    }
    
    function toggleRandomMode() {
        const isActive = randomToggle.classList.contains('active');
        const newState = !isActive;
        
        updateToggleState(randomToggle, newState);
        
        // Envia comando para content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleRandom' });
            }
        });
        
        // Atualiza exibição após um delay
        setTimeout(loadMusicInfo, 300);
    }
    
    function selectTrack(trackIndex) {
        // Envia comando para content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { 
                    action: 'changeTrack', 
                    trackIndex: trackIndex 
                });
            }
        });
        
        // Atualiza exibição após um delay
        setTimeout(loadMusicInfo, 300);
    }
    
    function previousTrack() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'previousTrack' });
            }
        });
        
        setTimeout(loadMusicInfo, 300);
    }
    
    function nextTrack() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'nextTrack' });
            }
        });
        
        setTimeout(loadMusicInfo, 300);
    }

    // ========== FUNÇÕES DE CONTINUIDADE MUSICAL ==========
    
    async function checkMusicContinuity() {
        try {
            const result = await chrome.storage.local.get(['shopping_music_continuity']);
            const continuityData = result.shopping_music_continuity;
            
            if (continuityData) {
                const age = Date.now() - continuityData.timestamp;
                const ageMinutes = Math.floor(age / 60000);
                
                if (age < 30 * 60 * 1000) { // Menos de 30 minutos
                    const trackName = continuityData.trackIndex !== undefined ? 
                        `Música ${continuityData.trackIndex + 1}` : 'Música';
                    const timeFormatted = Math.floor(continuityData.currentTime || 0);
                    
                    console.log(`🔄 Continuidade disponível: ${trackName} em ${timeFormatted}s (${ageMinutes} min atrás)`);
                    
                    // Adiciona indicador visual se houver continuidade
                    addContinuityIndicator(trackName, timeFormatted, ageMinutes);
                } else {
                    console.log(`⏰ Continuidade expirada (${ageMinutes} min)`);
                }
            }
        } catch (error) {
            console.error('Erro ao verificar continuidade:', error);
        }
    }
    
    function addContinuityIndicator(trackName, timeFormatted, ageMinutes) {
        // Remove indicador existente
        const existingIndicator = document.getElementById('continuity-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Cria novo indicador
        const indicator = document.createElement('div');
        indicator.id = 'continuity-indicator';
        indicator.style.cssText = `
            background: rgba(76, 175, 80, 0.2);
            border: 1px solid rgba(76, 175, 80, 0.5);
            border-radius: 8px;
            padding: 8px 12px;
            margin: 10px 0;
            font-size: 11px;
            text-align: center;
            color: #4CAF50;
        `;
        
        indicator.innerHTML = `
            🔄 <strong>Continuidade disponível</strong><br>
            ${trackName} • ${timeFormatted}s • ${ageMinutes} min atrás
        `;
        
        // Adiciona após a seção de controles principais
        const controlsSection = document.querySelector('.controls');
        if (controlsSection) {
            controlsSection.appendChild(indicator);
        }
    }

    // Verifica continuidade quando popup abre
    checkMusicContinuity();

    // Verifica o site atual quando o popup abre
    checkCurrentSite();

    // Escuta mensagens do content script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'updateStatus') {
            // Atualiza status visual se necessário
            checkCurrentSite();
            loadMusicInfo(); // Também recarrega info de música
        }
    });
});