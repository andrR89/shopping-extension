// Background Script - Gerencia o estado global da música
class MusicManager {
    constructor() {
        this.activeTabId = null;
        this.currentDomain = null;
        this.musicState = {
            isPlaying: false,
            currentTime: 0,
            volume: 0.3,
            domain: null
        };
        
        this.setupListeners();
    }

    setupListeners() {
        // Monitora mudanças de abas
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.handleTabChange(activeInfo.tabId);
        });

        // Monitora atualizações de abas (mudanças de URL)
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.handleTabUpdate(tabId, tab.url);
            }
        });

        // Escuta mensagens dos content scripts
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Mantém o canal de resposta aberto
        });

        // Monitora quando abas são fechadas
        chrome.tabs.onRemoved.addListener((tabId) => {
            if (tabId === this.activeTabId) {
                this.stopMusic();
            }
        });
    }

    async handleTabChange(tabId) {
        try {
            const tab = await chrome.tabs.get(tabId);
            if (tab.url) {
                this.handleTabUpdate(tabId, tab.url);
            }
        } catch (error) {
            console.log('Erro ao obter informações da aba:', error);
        }
    }

    handleTabUpdate(tabId, url) {
        try {
            const newDomain = new URL(url).hostname;
            const isShoppingSite = this.isShoppingSite(newDomain);

            if (isShoppingSite) {
                if (newDomain === this.currentDomain) {
                    // Mesma loja, continua música
                    this.sendToTab(tabId, {
                        action: 'restoreMusic',
                        musicState: this.musicState
                    });
                } else {
                    // Nova loja, para música anterior e inicia nova
                    this.stopMusic();
                    this.currentDomain = newDomain;
                    this.activeTabId = tabId;
                    this.sendToTab(tabId, {
                        action: 'startNewMusic',
                        domain: newDomain
                    });
                }
            } else {
                // Não é site de compras, para música
                if (this.musicState.isPlaying) {
                    this.stopMusic();
                }
            }
        } catch (error) {
            console.log('Erro ao processar mudança de aba:', error);
        }
    }

    handleMessage(request, sender, sendResponse) {
        console.log('📨 Background recebeu mensagem:', request.action, 'de tab:', sender.tab?.id);
        
        switch (request.action) {
            case 'musicStarted':
                // Para música em outras abas do mesmo domínio antes de iniciar nova
                if (this.activeTabId && this.activeTabId !== sender.tab.id) {
                    console.log('🛑 Parando música em aba anterior:', this.activeTabId);
                    this.sendToTab(this.activeTabId, { action: 'stopMusic' });
                }
                
                this.musicState = {
                    isPlaying: true,
                    currentTime: request.currentTime || 0,
                    volume: request.volume || 0.3,
                    domain: request.domain
                };
                this.currentDomain = request.domain;
                this.activeTabId = sender.tab.id;
                console.log('🎵 Música iniciada em aba:', sender.tab.id);
                sendResponse({ status: 'ok' });
                break;

            case 'musicStopped':
                if (sender.tab.id === this.activeTabId) {
                    this.musicState.isPlaying = false;
                    console.log('🛑 Música parada em aba ativa:', sender.tab.id);
                }
                sendResponse({ status: 'ok' });
                break;

            case 'updateMusicState':
                if (sender.tab.id === this.activeTabId) {
                    this.musicState = { ...this.musicState, ...request.state };
                }
                sendResponse({ status: 'ok' });
                break;

            case 'getMusicState':
                const shouldRestore = this.musicState.domain === new URL(sender.tab.url).hostname && 
                                    this.musicState.isPlaying &&
                                    this.activeTabId !== sender.tab.id;
                
                if (shouldRestore) {
                    console.log('🔄 Restaurando estado para nova aba:', sender.tab.id);
                }
                
                sendResponse({ 
                    musicState: shouldRestore ? this.musicState : null 
                });
                break;

            case 'getCurrentTab':
                // Retorna ID da aba atual
                sendResponse({ 
                    status: 'ok', 
                    tabId: sender.tab?.id || null 
                });
                break;

            default:
                sendResponse({ status: 'unknown_action' });
        }
    }

    stopMusic() {
        if (this.activeTabId && this.musicState.isPlaying) {
            this.sendToTab(this.activeTabId, { action: 'stopMusic' });
        }
        this.musicState.isPlaying = false;
        this.currentDomain = null;
        this.activeTabId = null;
    }

    sendToTab(tabId, message) {
        chrome.tabs.sendMessage(tabId, message).catch(() => {
            // Ignora erros se a aba não tiver content script
        });
    }

    isShoppingSite(hostname) {
        const shoppingSites = [
            'mercadolivre.com.br', 'mercadolibre.com', 'amazon.com', 'amazon.com.br',
            'ebay.com', 'aliexpress.com', 'shopee.com.br', 'americanas.com.br',
            'submarino.com.br', 'casasbahia.com.br', 'magazineluiza.com.br'
        ];

        return shoppingSites.some(site => 
            hostname.includes(site) || hostname.endsWith(site)
        );
    }
}

// Inicializa o gerenciador
new MusicManager();