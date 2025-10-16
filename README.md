# Shopping Music Player - Extensão Chrome

Uma extensão para Chrome que toca automaticamente uma música especial quando você visita sites de compras online, tornando sua experiência de compras mais divertida!

## 🎵 Funcionalidades

- **Detecção Automática**: Identifica automaticamente quando você está em um site de compras
- **Música Personalizada**: Toca a música especificada pelo usuário
- **Controles Intuitivos**: Interface simples para ativar/desativar e controlar volume
- **Sites Suportados**: Funciona com os principais sites de e-commerce brasileiros e internacionais

## 🛒 Sites Suportados

- Mercado Livre (mercadolivre.com.br, mercadolibre.com)
- Amazon (amazon.com, amazon.com.br)
- eBay (ebay.com)
- AliExpress (aliexpress.com)
- Shopee (shopee.com.br)
- Americanas (americanas.com.br)
- Submarino (submarino.com.br)
- Casas Bahia (casasbahia.com.br)
- Magazine Luiza (magazineluiza.com.br)

## 📦 Instalação

### Instalação Manual (Desenvolvimento)

1. Clone ou baixe este repositório
2. Abra o Chrome e vá para `chrome://extensions/`
3. Ative o "Modo do desenvolvedor" no canto superior direito
4. Clique em "Carregar sem compactação"
5. Selecione a pasta da extensão
6. A extensão será instalada e aparecerá na sua barra de ferramentas

### Preparando Arquivos de Áudio

**Importante**: Para que a música funcione, você precisa adicionar um arquivo de áudio:

1. Baixe ou converta a música desejada para formato MP3
2. Renomeie o arquivo para `shop-1.mp3` (ou o nome configurado)
3. Coloque o arquivo na pasta `audio/` da extensão
4. Atualize a extensão no Chrome

**Nota sobre o YouTube**: Devido às políticas de segurança do navegador, não é possível tocar diretamente vídeos do YouTube. Você precisa:
- Baixar o áudio do vídeo do YouTube como MP3
- Ou usar uma API de streaming de música
- Ou hospedar o arquivo de áudio em um servidor

## 🎛️ Como Usar

1. **Ativação**: Clique no ícone da extensão na barra de ferramentas
2. **Configurações**: Use o popup para ativar/desativar e ajustar volume
3. **Automático**: A música tocará automaticamente quando você visitar um site de compras
4. **Controles**: Use os controles flutuantes no site para pausar/reproduzir

## ⚙️ Configurações

A extensão oferece as seguintes opções de configuração:

- **Ativar/Desativar Música**: Toggle principal para controlar a funcionalidade
- **Controle de Volume**: Ajuste o volume da música (0-100%)
- **Teste de Música**: Botão para testar a reprodução
- **Status dos Sites**: Indicadores visuais dos sites suportados

## 🔧 Estrutura do Projeto

```
buying-extension/
├── manifest.json          # Configuração da extensão
├── content.js            # Script que roda nas páginas
├── popup.html           # Interface do popup
├── popup.js            # Lógica do popup
├── icons/             # Ícones da extensão (16, 32, 48, 128px)
├── audio/            # Arquivos de áudio
│   └── shop-1.mp3
└── README.md        # Este arquivo
```

## 🔒 Permissões

A extensão solicita as seguintes permissões:

- `activeTab`: Para interagir com a aba ativa
- `storage`: Para salvar configurações do usuário
- `host_permissions`: Para acessar sites de compras específicos

## 🐛 Solução de Problemas

### A música não toca automaticamente
- Verifique se o arquivo `shop-1.mp3` está na pasta `audio/`
- Alguns navegadores bloqueiam autoplay - clique no botão de reproduzir quando solicitado
- Verifique se a extensão está ativada no popup

### A extensão não funciona em um site
- Verifique se o site está na lista de sites suportados
- Recarregue a página após instalar a extensão
- Verifique se não há erros no console do desenvolvedor

### Problemas de volume
- Use os controles no popup para ajustar o volume
- Verifique o volume do sistema operacional
- Alguns sites podem ter políticas de áudio restritivas

## 🚀 Melhorias Futuras

- [ ] Suporte para mais sites de e-commerce
- [ ] Playlist de múltiplas músicas
- [ ] Integração com APIs de streaming
- [ ] Temas visuais personalizáveis
- [ ] Estatísticas de uso
- [ ] Sincronização entre dispositivos

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 🤝 Contribuições

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Se você encontrar problemas ou tiver sugestões:

1. Abra uma issue no GitHub
2. Use o botão de feedback na extensão
3. Verifique a documentação e FAQ

---

**Desenvolvido com ❤️ para tornar suas compras online mais divertidas!** 🛒🎵# shopping-extension
