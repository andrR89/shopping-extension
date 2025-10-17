# 📝 Justificativas para Chrome Web Store

## 🎯 **Descrição do Único Propósito**
```
O Shopping Music Player tem um único propósito: reproduzir música de fundo automaticamente quando o usuário visita sites de e-commerce para tornar a experiência de compras mais agradável e relaxante. A extensão detecta sites de compras e inicia reprodução musical discreta com controles simples para o usuário.
```

## 🔧 **Justificativa para activeTab**
```
A permissão activeTab é necessária para detectar quando o usuário está navegando em sites de e-commerce (Amazon, Mercado Livre, eBay, etc.) e injetar os controles de música discretos na página. Esta permissão permite que a extensão identifique o tipo de site visitado e ative a reprodução musical apenas em sites de compras, garantindo uma experiência contextual e relevante.
```

## 🌐 **Justificativa para Permissão de Host**
```
As permissões de host são essenciais para identificar sites de e-commerce e fornecer a experiência musical contextual. A extensão precisa acessar:

• *://*.amazon.*/* - Para funcionar em todas as versões do Amazon (Brasil, EUA, Europa)
• *://*.mercadolivre.*/* - Para Mercado Livre e variações regionais
• *://*.ebay.*/* - Para eBay internacional
• *://*.aliexpress.*/* - Para AliExpress
• *://*.shopee.*/* - Para Shopee
• *://*.americanas.*/* - Para Americanas
• *://*.magazineluiza.*/* - Para Magazine Luiza

Essas permissões são usadas exclusivamente para detectar o contexto de e-commerce e injetar controles musicais discretos. Não coletamos, armazenamos ou transmitimos dados dos usuários ou das páginas visitadas.
```

## 💾 **Justificativa para Storage**
```
A permissão de storage é necessária para salvar as preferências do usuário localmente, incluindo:

• Música preferida (shop-1.mp3 ou shop-2.mp3)
• Modo de reprodução (aleatório ou sequencial) 
• Estado de reprodução (tocando/pausado)
• Configurações de volume

Todos os dados ficam armazenados localmente no navegador do usuário e nunca são enviados para servidores externos. Isso garante uma experiência personalizada e privada.
```

## 📞 **Informações de Contato**

### Email de Contato
```
andre.rogerio.dev@gmail.com
```

### Processo de Verificação de Email
```
Para verificar o email andre.rogerio.dev@gmail.com:
1. Acesse sua conta Gmail
2. Procure por email de verificação da Chrome Web Store
3. Clique no link de verificação
4. Confirme a verificação
```

## 🏷️ **Justificativa para Tabs**
```
A permissão de tabs é necessária para:

• Detectar mudanças de URL em navegação SPA (Single Page Application)
• Manter continuidade musical entre páginas do mesmo site
• Pausar/retomar música quando usuário navega entre abas
• Garantir que apenas uma instância da música toque por vez

Esta permissão não é usada para monitorar atividade de navegação ou coletar dados, apenas para fornecer experiência musical contínua e contextual.
```

## 📋 **Resumo das Funcionalidades**

### Único Propósito
```
Música automática para sites de e-commerce
```

### Justificativa Simples
```
O Shopping Music Player reproduz música relaxante automaticamente em sites de compras para melhorar a experiência do usuário. Precisa detectar sites de e-commerce e manter preferências localmente.
```

### Email Verificado
```
andre.rogerio.dev@gmail.com
```

## ⚠️ **Notas Importantes**

1. **Sem Coleta de Dados**: Enfatizar que não coletamos dados pessoais
2. **Funcionalidade Local**: Tudo funciona no dispositivo do usuário
3. **Propósito Específico**: Apenas música em sites de compras
4. **Transparência**: Código pode ser auditado
5. **Privacidade**: Nenhum dado sai do dispositivo do usuário

## 🔄 **Textos Alternativos Curtos**

### Descrição Única (Curta)
```
Reproduz música relaxante automaticamente em sites de e-commerce para melhorar a experiência de compras online.
```

### Justificativa Simples
```
Detecta sites de compras e reproduz música de fundo. Salva preferências localmente.
```

### Host Permission (Resumida)
```
Necessário para identificar sites de e-commerce (Amazon, Mercado Livre, etc.) e ativar música contextual.
```