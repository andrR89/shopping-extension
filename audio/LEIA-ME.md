# Instruções para Adicionar a Música

Como a extensão não pode tocar diretamente do YouTube devido às políticas de segurança do navegador, você precisa adicionar o arquivo de áudio manualmente.

## Passo a Passo para Adicionar a Música

### Opção 1: Baixar do YouTube (Recomendado)

1. **Baixe o áudio do YouTube**:
   - Vá para: https://www.youtube.com/watch?v=3_soYT__b9U&list=PL49AC5D420FA55436&index=8
   - Use um conversor online como:
     - https://ytmp3.cc/
     - https://www.youtube-mp3.org/
     - https://www.onlinevideoconverter.com/
   
2. **Prepare o arquivo**:
   - Baixe como MP3
   - Renomeie para `shop-1.mp3` (ou mantenha o nome atual)
   - Coloque na pasta `audio/` desta extensão

3. **Atualize a extensão**:
   - Vá para `chrome://extensions/`
   - Clique no botão de reload da extensão

### Opção 2: Usar um Arquivo de Exemplo

Se você quiser testar rapidamente, pode usar qualquer arquivo MP3 que você tenha:

1. Renomeie seu arquivo MP3 para `shop-1.mp3`
2. Coloque na pasta `audio/`
3. Recarregue a extensão

### Opção 3: Hospedar o Arquivo Online

1. Hospede seu arquivo MP3 em um servidor (Google Drive, Dropbox, etc.)
2. Modifique o arquivo `content.js` na linha onde está `chrome.runtime.getURL('audio/shop-1.mp3')`
3. Substitua pela URL do seu arquivo hospedado

## ⚠️ Importante

- O arquivo deve estar no formato MP3 para melhor compatibilidade
- O nome deve ser exatamente `shop-1.mp3` (conforme configurado no código)
- Certifique-se de que o arquivo não esteja corrompido
- O tamanho recomendado é de até 10MB para melhor performance

## 🔧 Testando

Após adicionar o arquivo:

1. Abra a extensão (clique no ícone)
2. Clique em "🎵 Testar Música"
3. Vá para um site de compras (ex: mercadolivre.com.br)
4. A música deve tocar automaticamente

## 🎵 Configurações de Áudio

No arquivo `content.js`, você pode ajustar:

```javascript
// Volume padrão (0.0 a 1.0)
this.audioElement.volume = 0.3; // 30% do volume

// Loop (repetir a música)
this.audioElement.loop = true;
```