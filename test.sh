#!/bin/bash

# Script de teste para verificar se a extensão está funcionando corretamente

echo "🧪 TESTE DA EXTENSÃO - Shopping Music Player"
echo "============================================="
echo ""

# Verifica arquivo de áudio
if [ -f "audio/shop-1.mp3" ]; then
    echo "✅ Arquivo de áudio encontrado: audio/shop-1.mp3"
    echo "📊 Tamanho do arquivo: $(ls -lh audio/shop-1.mp3 | awk '{print $5}')"
    echo "🕒 Data de modificação: $(ls -l audio/shop-1.mp3 | awk '{print $6, $7, $8}')"
else
    echo "❌ ERRO: Arquivo de áudio não encontrado!"
    echo "   Certifique-se de que 'audio/shop-1.mp3' existe"
fi

echo ""

# Verifica arquivos principais
echo "📁 Verificando arquivos principais:"
FILES=("manifest.json" "content.js" "background.js" "popup.html" "popup.js")

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - AUSENTE"
    fi
done

echo ""

# Verifica permissões no manifest
echo "🔒 Verificando permissões no manifest.json:"
if grep -q '"tabs"' manifest.json; then
    echo "✅ Permissão 'tabs' encontrada"
else
    echo "❌ Permissão 'tabs' ausente"
fi

if grep -q '"storage"' manifest.json; then
    echo "✅ Permissão 'storage' encontrada"
else
    echo "❌ Permissão 'storage' ausente"
fi

if grep -q 'background.js' manifest.json; then
    echo "✅ Background script configurado"
else
    echo "❌ Background script não configurado"
fi

echo ""

# Verifica sites suportados
echo "🛒 Sites suportados configurados:"
if grep -q 'mercadolivre.com.br' content.js; then
    echo "✅ Mercado Livre"
fi
if grep -q 'amazon.com' content.js; then
    echo "✅ Amazon"
fi
if grep -q 'shopee.com.br' content.js; then
    echo "✅ Shopee"
fi

echo ""

# Instruções de instalação
echo "🚀 COMO TESTAR:"
echo "1. Abra Chrome → chrome://extensions/"
echo "2. Ative 'Modo do desenvolvedor'"
echo "3. Clique 'Carregar sem compactação'"
echo "4. Selecione esta pasta"
echo "5. Vá para mercadolivre.com.br"
echo "6. Abra Console (F12) para ver logs"
echo ""

echo "🔍 LOGS ESPERADOS NO CONSOLE:"
echo "• 🛒 Site de compras detectado: [domínio]"
echo "• 🎵 Inicializando Shopping Music Player..."
echo "• ✅ Áudio carregado e pronto para reprodução"
echo "• ✅ Autoplay bem-sucedido - Volume normal!"
echo ""

echo "💡 DICAS DE DEBUG:"
echo "• Verifique o console do navegador (F12)"
echo "• Teste em uma nova aba anônima"
echo "• Certifique-se de que o áudio não está mutado"
echo "• Teste com diferentes navegadores"