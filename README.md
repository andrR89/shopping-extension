# 🎵 Shopping Music Extension

**Extensão Chrome que toca música automaticamente em sites de compras para criar uma experiência mais agradável de navegação.**

## 🚀 Versão Atual: v1.9.7

### ✨ Principais Features
- 🎵 **Música automática** em sites de compras
- 🎧 **Duas músicas** com alternância automática/manual
- 🔀 **Modo aleatório** ou sequencial
- 🔄 **Continuidade perfeita** em navegação SPA
- ⚡ **Performance otimizada** (autoplay instantâneo)
- 🎛️ **Controles visuais** modernos e discretos

## 🎯 Sites Suportados
- Amazon
- Mercado Livre  
- eBay
- AliExpress
- E muitos outros sites de e-commerce

## 🔧 Como Funciona

1. **Detecção Automática**: Identifica quando você entra em um site de compras
2. **Música Instantânea**: Começa a tocar imediatamente (não espera DOM)
3. **Navegação Fluida**: Mantém música tocando durante navegação SPA
4. **Controles Inteligentes**: Interface discreta no canto superior direito

## 📦 Instalação

1. Faça download dos arquivos da extensão
2. Abra Chrome → Extensões → Mode Desenvolvedor
3. Clique "Carregar expandida" → Selecione a pasta
4. Pronto! A música tocará automaticamente em sites de compras

## 🎮 Como Usar

### Controles Automáticos
- **Play/Pause**: Clique no botão central
- **Próxima música**: Seta direita
- **Música anterior**: Seta esquerda  
- **Modo aleatório**: Ícone shuffle (🔀)

### Popup da Extensão
- Escolha entre as duas músicas disponíveis
- Ative/desative modo aleatório
- Veja status de continuidade musical

## 📁 Estrutura de Arquivos

```
shopping-extension/
├── manifest.json          # Configuração da extensão
├── content.js             # Script principal (1700+ linhas)
├── background.js          # Service worker
├── popup.html/js/css      # Interface da extensão
├── audio/                 # Arquivos de música
│   ├── shop-1.mp3
│   └── shop-2.mp3
└── docs/                  # Documentação organizada
    ├── features/          # Documentação de funcionalidades
    ├── changelogs/        # Histórico de versões
    ├── development/       # Notas de desenvolvimento
    └── archive/           # Documentos antigos
```

## 🔄 Últimas Atualizações (v1.9.7)

### ⚡ Performance Ultra-Rápida
- **Navegação SPA**: Música restaura em ~50ms (6x mais rápido)
- **Autoplay instantâneo**: Não espera mais DOM renderizar
- **Controles paralelos**: Interface não bloqueia música

### 🔧 Melhorias Técnicas
- Sistema de standby inteligente para múltiplas instâncias
- Detecção genérica de SPA (funciona em qualquer site)
- Carregamento de áudio otimizado e paralelo

## 📚 Documentação Completa

- **Features**: [`docs/features/`](docs/features/) - Funcionalidades detalhadas
- **Changelogs**: [`docs/changelogs/`](docs/changelogs/) - Histórico de versões
- **Development**: [`docs/development/`](docs/development/) - Notas técnicas

## 🎯 Tecnologias

- **Manifest V3**: Última versão do Chrome Extensions
- **ES6+ JavaScript**: Sintaxe moderna e performática
- **Chrome APIs**: Storage, Runtime, Background
- **HTML5 Audio**: Controle avançado de mídia

## 🤝 Contribuição

Este projeto é de código aberto. Sinta-se livre para:
- Relatar bugs
- Sugerir melhorias
- Adicionar novas músicas
- Expandir suporte a novos sites

## 📄 Licença

MIT License - Use como quiser! 🎉

---

**Desenvolvido com ❤️ para tornar suas compras online mais musicais!** 🛒🎵

> Extensão do Chrome que reproduz automaticamente sua música favorita ao entrar em sites de compras online.

## 🎯 Funcionalidades

### ✨ Principais Recursos
- 🛒 **Detecção Automática**: Identifica sites de compras (Mercado Livre, Amazon, eBay, etc.)
- 🎵 **Música Personalizada**: Reproduz sua música favorita (`audio/shop-1.mp3`)
- 🔄 **Navegação Contínua**: Música continua tocando ao navegar entre páginas
- 🎛️ **Controles Discretos**: Player fixo no canto superior direito
- ⚙️ **Configurável**: Interface de configurações no popup da extensão
- 🔊 **Volume Ajustável**: Controle de volume integrado
- 📢 **Notificações Opcionais**: Avisos discretos para ativação manual

### 🛡️ Sistema Anti-Duplicação
- **Singleton Pattern**: Apenas uma instância de música por vez
- **Coordenação Global**: Usa `chrome.storage.local` para sincronização
- **Limpeza Automática**: Remove áudios órfãos de navegações anteriores
- **Monitoramento Ativo**: Verifica outras instâncias a cada 3 segundos

## 🏗️ Arquitetura

### 📁 Estrutura de Arquivos
```
buying-extension/
├── manifest.json          # Configuração da extensão
├── content.js             # Script principal (734 linhas)
├── background.js          # Service worker (172 linhas)  
├── popup.html            # Interface de configurações
├── popup.js              # Lógica do popup (216 linhas)
├── audio/
│   └── shop-1.mp3        # Música personalizada
├── icons/
│   ├── icon16.png        # Ícones da extensão
│   ├── icon48.png
│   └── icon128.png
├── README.md             # Este arquivo
├── CHANGELOG.md          # Histórico de versões
└── install.sh           # Script de instalação
```

### 🔧 Componentes Técnicos

#### 1. Content Script (`content.js`)
```javascript
class ShoppingMusicPlayer {
    constructor() {
        this.instanceId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        this.globalKey = 'shopping_music_global_state';
        // ... sistema singleton
    }
}
```
- **Função**: Script injetado nas páginas de compras
- **Singleton**: Previne múltiplas instâncias usando storage global
- **Recursos**: Autoplay, controles visuais, comunicação com background

#### 2. Background Script (`background.js`)
```javascript
class MusicManager {
    constructor() {
        this.setupTabListeners();
        this.setupMessageHandlers();
    }
}
```
- **Função**: Service worker para coordenação global
- **Recursos**: Gerencia estado entre abas, monitora navegação

#### 3. Popup Interface (`popup.html` + `popup.js`)
- **Função**: Interface de configurações do usuário
- **Recursos**: Toggle de ativação, controle de volume, configurações

## 🚀 Instalação

### Método 1: Script Automático
```bash
cd /path/to/buying-extension
chmod +x install.sh
./install.sh
```

### Método 2: Manual
1. Abra o Chrome e vá para `chrome://extensions/`
2. Ative o "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `buying-extension`

## ⚙️ Configuração

### 🎵 Adicionar Sua Música
1. Substitua o arquivo `audio/shop-1.mp3` pela sua música favorita
2. Mantenha o formato MP3 para compatibilidade
3. Recomendado: arquivo com até 10MB

### 🎛️ Configurações Disponíveis
- **Música Ativada**: Liga/desliga a extensão
- **Volume**: Controle de 0% a 100%
- **Notificações**: Mostrar/ocultar avisos de ativação

## 🛒 Sites Suportados

### 🌎 Principais Plataformas
- **Brasil**: Mercado Livre, Americanas, Submarino, Magazine Luiza, Casas Bahia, Shopee
- **Internacional**: Amazon (todos os países), eBay, AliExpress

### ➕ Adicionar Novos Sites
Edite a função `isShoppingSite()` em `content.js`:
```javascript
const shoppingSites = [
    'mercadolivre.com.br',
    'amazon.com',
    'seunovo.site.com'  // ← Adicione aqui
];
```

## 🔧 Como Funciona

### 🔄 Fluxo de Execução
1. **Detecção**: Extension verifica se a página é um site de compras
2. **Verificação**: Confere se já existe música ativa (singleton)
3. **Inicialização**: Cria instância única se autorizada
4. **Reprodução**: Tenta autoplay com múltiplas estratégias
5. **Monitoramento**: Supervisiona outras instâncias em paralelo
6. **Limpeza**: Remove recursos ao navegar/fechar

### 🧠 Sistema Singleton
```javascript
// Verificação de instância ativa
const existingState = await this.getGlobalState();
if (existingState && existingState.isActive && (now - existingState.timestamp) < 5000) {
    console.log('Instância ativa encontrada, abortando');
    return;
}

// Registro como instância ativa
await this.setGlobalState({
    isActive: true,
    instanceId: this.instanceId,
    timestamp: Date.now()
});
```

### 🔁 Autoplay Inteligente
A extensão usa várias estratégias para contornar restrições do browser:
1. **Autoplay direto**: Tentativa padrão
2. **Volume baixo**: Inicia com volume 0.05 e aumenta gradualmente
3. **Muted primeiro**: Inicia mutado e depois ativa som
4. **Interação do usuário**: Aguarda clique/scroll para ativar
5. **Notificação discreta**: Último recurso com botão manual

## 🐛 Solução de Problemas

### ❓ Problemas Comuns

#### Música não toca automaticamente
- **Causa**: Restrições de autoplay do browser
- **Solução**: Clique em qualquer lugar da página ou na notificação

#### Múltiplas músicas tocando
- **Causa**: Bug resolvido na v1.6
- **Solução**: Atualize para versão mais recente

#### Música para ao navegar
- **Causa**: Configuração incorreta
- **Solução**: Verifique se o background script está ativo

### 🔍 Debug
Abra o DevTools (F12) e procure por logs com:
- `🎵` - Logs da música
- `🛒` - Detecção de sites
- `🔄` - Sistema singleton

## 📊 Performance

### 📈 Métricas (v1.6)
- **Tempo de inicialização**: ~500ms
- **Uso de memória**: ~5MB (redução de 60%)
- **CPU**: Mínimo (checks a cada 3s)
- **Storage**: <1KB de dados

### ⚡ Otimizações
- Reuso de elementos de áudio existentes
- Limpeza automática de recursos órfãos
- Monitoramento eficiente com intervalos espaçados
- Singleton pattern para prevenir duplicação

## 🔮 Próximas Versões

### 🎯 Roadmap
- [ ] **Playlist Personalizada**: Múltiplas músicas em rotação
- [ ] **Sincronização Multi-Aba**: Estado compartilhado entre todas as abas
- [ ] **Histórico de Reprodução**: Log de músicas tocadas
- [ ] **Equalizer Simples**: Controles de graves/agudos
- [ ] **Modo Silencioso**: Horários programados sem música
- [ ] **Integração com Spotify**: Playlist externa (se possível)

## 📄 Licença

Este projeto é de código aberto para uso pessoal e educacional.

## 👨‍💻 Desenvolvimento

### 🛠️ Tecnologias Usadas
- **Manifest V3**: Padrão moderno de extensões Chrome
- **Vanilla JavaScript**: ES6+ com async/await
- **Chrome APIs**: Storage, Runtime, Tabs
- **HTML5 Audio API**: Reprodução nativa de áudio
- **CSS3**: Animações e estilos modernos

### 🤝 Contribuindo
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**🎵 Happy Shopping! 🛒**