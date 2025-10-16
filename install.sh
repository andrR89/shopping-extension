#!/bin/bash

# Shopping Music Player - Script de Instalação
# Este script ajuda na configuração da extensão

echo "🎵 Shopping Music Player - Configuração"
echo "======================================"
echo ""

# Verifica se estamos no diretório correto
if [ ! -f "manifest.json" ]; then
    echo "❌ Erro: Execute este script na pasta da extensão"
    exit 1
fi

echo "📁 Estrutura de arquivos:"
echo "✅ manifest.json encontrado"
echo "✅ content.js encontrado"
echo "✅ popup.html encontrado"
echo "✅ popup.js encontrado"
echo ""

# Verifica se a pasta de áudio existe
if [ ! -d "audio" ]; then
    echo "📁 Criando pasta audio/"
    mkdir -p audio
fi

# Verifica se o arquivo de música existe
if [ ! -f "audio/shop-1.mp3" ]; then
    echo "⚠️  ATENÇÃO: Arquivo de música não encontrado!"
    echo ""
    echo "Para que a extensão funcione completamente, você precisa:"
    echo "1. Baixar o áudio do YouTube: https://www.youtube.com/watch?v=3_soYT__b9U"
    echo "2. Converter para MP3"
    echo "3. Renomear para 'shop-1.mp3'"
    echo "4. Colocar na pasta 'audio/'"
    echo ""
    echo "Veja as instruções detalhadas em: audio/LEIA-ME.md"
    echo ""
else
    echo "✅ Arquivo de música encontrado: audio/shop-1.mp3"
fi

# Verifica se os ícones existem
if [ ! -d "icons" ]; then
    echo "❌ Pasta icons/ não encontrada"
    exit 1
else
    echo "✅ Ícones encontrados na pasta icons/"
fi

echo ""
echo "🚀 Como instalar a extensão no Chrome:"
echo "1. Abra o Chrome"
echo "2. Vá para chrome://extensions/"
echo "3. Ative o 'Modo do desenvolvedor'"
echo "4. Clique em 'Carregar sem compactação'"
echo "5. Selecione esta pasta: $(pwd)"
echo ""

echo "🎯 Sites suportados:"
echo "• Mercado Livre"
echo "• Amazon"
echo "• eBay"
echo "• Shopee"
echo "• Americanas"
echo "• Magazine Luiza"
echo "• E outros sites de e-commerce"
echo ""

echo "✨ Configuração concluída!"
echo "Agora você pode instalar a extensão no Chrome."