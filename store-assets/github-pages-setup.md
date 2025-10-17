# 🌐 Como Configurar GitHub Pages

## 🎯 **Passo a Passo Completo**

### 1. **Acessar Configurações do Repositório**
1. Vá para: https://github.com/andrR89/shopping-extension
2. Clique na aba **"Settings"** (⚙️)
3. No menu lateral esquerdo, procure **"Pages"**

### 2. **Configurar GitHub Pages**

#### **Source (Fonte):**
- Selecione: **"Deploy from a branch"**

#### **Branch:**
- Selecione: **"main"** (ou master se for o caso)
- Pasta: **"/ (root)"** 

#### **Clique em "Save"**

### 3. **Aguardar Deploy**
- GitHub levará **2-10 minutos** para processar
- Aparecerá uma mensagem: *"Your site is published at..."*
- URL será: **`https://andrr89.github.io/shopping-extension/`**

### 4. **URLs Disponíveis Após Deploy**

#### **Política de Privacidade:**
```
https://andrr89.github.io/shopping-extension/privacy-policy.html
```

#### **Documentação (Markdown):**
```
https://andrr89.github.io/shopping-extension/docs/
```

#### **Página Principal:**
```
https://andrr89.github.io/shopping-extension/
```

---

## 🛠️ **Configuração Alternativa (Se Necessário)**

### **Opção 1: Usar Pasta `docs/`**
Se quiser organizar melhor:

1. Na configuração do Pages
2. Branch: **"main"**
3. Pasta: **"/docs"**
4. URL ficará: `https://andrr89.github.io/shopping-extension/`

### **Opção 2: Branch Separada**
Para projetos maiores:

```bash
# Criar branch gh-pages
git checkout -b gh-pages
git push -u origin gh-pages
```

Então configurar Pages para usar branch `gh-pages`.

---

## 📋 **Checklist de Configuração**

### ✅ **No GitHub Web:**
- [ ] Ir em Settings → Pages
- [ ] Source: "Deploy from a branch"
- [ ] Branch: "main"
- [ ] Pasta: "/ (root)"
- [ ] Clicar "Save"
- [ ] Aguardar deploy (2-10 min)

### ✅ **Testar URLs:**
- [ ] `https://andrr89.github.io/shopping-extension/privacy-policy.html`
- [ ] `https://andrr89.github.io/shopping-extension/docs/`
- [ ] Verificar se carregam corretamente

### ✅ **Para Chrome Web Store:**
- [ ] Usar URL do GitHub Pages na política de privacidade
- [ ] Testar se URL está acessível publicamente
- [ ] Verificar se conteúdo está completo
- [ ] Preencher "Práticas de privacidade" (todas respostas "NÃO")

---

## 🚨 **Soluções para Problemas Comuns**

### **Problema**: "404 - Page not found"
**Soluções:**
- Aguardar mais tempo (até 30 min no primeiro deploy)
- Verificar se arquivos estão na branch correta
- Checar se nomes dos arquivos estão corretos

### **Problema**: Política não carrega
**Soluções:**
- Verificar se `privacy-policy.html` está na raiz
- Testar URL diretamente no navegador
- Usar URL raw do GitHub como alternativa

### **Problema**: GitHub Pages não aparece nas configurações
**Soluções:**
- Repositório deve ser público
- Ter pelo menos um arquivo na branch main
- Aguardar algumas horas após criação do repo

---

## 📱 **URLs Alternativas (Backup)**

### **GitHub Raw (sempre funciona):**
```
https://raw.githubusercontent.com/andrR89/shopping-extension/main/privacy-policy.html
```

### **GitHub Blob (visualização):**
```
https://github.com/andrR89/shopping-extension/blob/main/store-assets/privacy-policy.md
```

---

## 🎯 **Após Configurar GitHub Pages**

### **Para Chrome Web Store:**
1. **Guia "Privacidade"** → Cole a URL do GitHub Pages
2. **Testar URL** antes de submeter
3. **Aguardar aprovação** (URL deve estar acessível)

### **URL Recomendada para Chrome Web Store:**
```
https://andrr89.github.io/shopping-extension/privacy-policy.html
```

---

## ⏱️ **Timeline Esperado**

- **0-2 min:** Configurar Pages no GitHub
- **2-10 min:** Primeiro deploy automático
- **10+ min:** URL totalmente acessível
- **Depois:** Atualizações automáticas a cada push

---

## 🔄 **Próximos Passos**

1. **Configurar GitHub Pages** (2 minutos)
2. **Aguardar deploy** (5-10 minutos)
3. **Testar URL** da política de privacidade
4. **Usar URL** na Chrome Web Store
5. **Submeter extensão** para aprovação

**🚀 GitHub Pages é gratuito e perfeito para hospedar a política de privacidade!**