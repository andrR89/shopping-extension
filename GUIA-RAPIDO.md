# 🎵 Shopping Music Player - Guia Rápido

## 📦 Instalação (5 minutos)

1. **Clone/Baixe este projeto**
2. **Adicione a música**:
   - Baixe o áudio de: https://www.youtube.com/watch?v=3_soYT__b9U
   - Converta para MP3
   - Renomeie para `shop-1.mp3`
   - Coloque na pasta `audio/`

3. **Instale no Chrome**:
   - Abra `chrome://extensions/`
   - Ative "Modo do desenvolvedor"
   - Clique "Carregar sem compactação"
   - Selecione esta pasta

## 🎯 Como Usar

1. **Automático**: A música toca quando você visita sites de compras
2. **Manual**: Clique no ícone da extensão para controles
3. **Configuração**: Ajuste volume e ative/desative no popup

## 🛒 Sites que Funcionam

- Mercado Livre
- Amazon 
- eBay
- Shopee
- Americanas
- Magazine Luiza

## 🔧 Solução de Problemas

### Música não toca?
- ✅ Arquivo `shop-1.mp3` na pasta `audio/`
- ✅ Extensão ativada no popup
- ✅ Permite autoplay quando solicitado

### Extensão não aparece?
- ✅ Modo desenvolvedor ativado
- ✅ Extensão recarregada após mudanças
- ✅ Sem erros no console (`chrome://extensions/`)

## 🎵 Personalizações

### Trocar música:
1. Substitua `audio/shop-1.mp3`
2. Recarregue a extensão

### Adicionar sites:
1. Edite `manifest.json` (host_permissions)
2. Edite `content.js` (shoppingSites array)
3. Recarregue a extensão

---

**Divirta-se fazendo compras com música! 🛒🎵**