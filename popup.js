// Popup Script para Shopping Music Player
document.addEventListener('DOMContentLoaded', function() {
    const musicToggle = document.getElementById('musicToggle');
    const notificationsToggle = document.getElementById('notificationsToggle');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const testMusicBtn = document.getElementById('testMusic');
    const aboutBtn = document.getElementById('aboutBtn');
    const feedbackBtn = document.getElementById('feedbackBtn');

    // Carrega configurações salvas
    loadSettings();

    // Event Listeners
    musicToggle.addEventListener('click', toggleMusic);
    notificationsToggle.addEventListener('click', toggleNotifications);
    volumeSlider.addEventListener('input', updateVolume);
    testMusicBtn.addEventListener('click', testMusic);
    aboutBtn.addEventListener('click', showAbout);
    feedbackBtn.addEventListener('click', showFeedback);

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

    // Verifica o site atual quando o popup abre
    checkCurrentSite();

    // Escuta mensagens do content script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'updateStatus') {
            // Atualiza status visual se necessário
            checkCurrentSite();
        }
    });
});