import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Code2,
  ShieldCheck,
  Flame,
  Settings,
  Eye,
  Github,
  Sparkles,
  UserCheck,
  FileCode,
  Palette,
  ExternalLink,
  Layers,
  Save
} from 'lucide-react';
import { UserProfile, Product, Purchase } from '../types';
import { registerPurchase, firebaseConfig as defaultFirebaseConfig } from '../firebase';
import confetti from 'canvas-confetti';

interface WikiConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  product: Product;
  onSuccess: (purchase: Purchase) => void;
}

export const WikiConfiguratorModal: React.FC<WikiConfiguratorModalProps> = ({
  isOpen,
  onClose,
  user,
  product,
  onSuccess
}) => {
  if (!isOpen) return null;

  // Active step in configurator
  const [activeStep, setActiveStep] = useState<'bureaucrat' | 'firebase' | 'wiki' | 'preview'>('bureaucrat');

  // 1. Bureaucrat Settings
  const [bureaucratType, setBureaucratType] = useState<'both' | 'uid' | 'email'>('both');
  const [bureaucratUid, setBureaucratUid] = useState(
    user?.uid || 'sZxfMuOBPbXdR8nttVPXIN8QOOl1'
  );
  const [bureaucratEmail, setBureaucratEmail] = useState(
    user?.email || 'mafersao1100@gmail.com'
  );
  const [additionalBureaucrats, setAdditionalBureaucrats] = useState('6aPqWVh8JVYL5NqEb78iDGPD7dH3');

  // 2. Firebase Settings
  const [firebaseSource, setFirebaseSource] = useState<'default' | 'custom'>('default');
  const [fbApiKey, setFbApiKey] = useState(defaultFirebaseConfig.apiKey);
  const [fbAuthDomain, setFbAuthDomain] = useState(defaultFirebaseConfig.authDomain);
  const [fbProjectId, setFbProjectId] = useState(defaultFirebaseConfig.projectId);
  const [fbStorageBucket, setFbStorageBucket] = useState(defaultFirebaseConfig.storageBucket);
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState(defaultFirebaseConfig.messagingSenderId);
  const [fbAppId, setFbAppId] = useState(defaultFirebaseConfig.appId);

  // 3. Wiki Identity & Features
  const [wikiTitle, setWikiTitle] = useState('WikiWorldWeb Alternative');
  const [wikiSubtitle, setWikiSubtitle] = useState('Enciclopédia Colaborativa Livre & Descentralizada');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [themePreset, setThemePreset] = useState<'blue' | 'emerald' | 'purple' | 'amber' | 'slate'>('blue');
  const [allowPublicEditing, setAllowPublicEditing] = useState(true);
  const [articlesCollection, setArticlesCollection] = useState('artigos_wiki');
  const [enableComments, setEnableComments] = useState(true);

  // Download & Copy states
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.uid && !bureaucratUid) {
      setBureaucratUid(user.uid);
    }
    if (user?.email && !bureaucratEmail) {
      setBureaucratEmail(user.email);
    }
  }, [user]);

  // Color preset selector
  const handleSelectPreset = (preset: 'blue' | 'emerald' | 'purple' | 'amber' | 'slate') => {
    setThemePreset(preset);
    switch (preset) {
      case 'blue':
        setPrimaryColor('#2563eb');
        break;
      case 'emerald':
        setPrimaryColor('#059669');
        break;
      case 'purple':
        setPrimaryColor('#7c3aed');
        break;
      case 'amber':
        setPrimaryColor('#d97706');
        break;
      case 'slate':
        setPrimaryColor('#1e293b');
        break;
    }
  };

  // Generate the modified code
  const generateModifiedHtmlCode = () => {
    const allUids = [bureaucratUid, ...additionalBureaucrats.split(',').map((s) => s.trim())].filter(Boolean);
    const allEmails = [bureaucratEmail].filter(Boolean);

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${wikiTitle} - Wiki-Alternative</title>
    <!-- Repositório Original: https://github.com/WazzimaGiygg/Wiki-alternative -->
    <!-- Configurado e Gerado via WikiWorldWeb Central de Produtos -->
    
    <!-- Firebase SDKs -->
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #f8fafc;
            color: #0f172a;
        }
        :root {
            --primary: ${primaryColor};
        }
    </style>
</head>
<body class="min-h-screen flex flex-col">

    <!-- NAVBAR DA WIKI-ALTERNATIVE -->
    <header class="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md" style="background-color: var(--primary);">
                    🌐
                </div>
                <div>
                    <h1 class="font-extrabold text-base tracking-tight">${wikiTitle}</h1>
                    <p class="text-[10px] text-slate-400">${wikiSubtitle}</p>
                </div>
            </div>

            <!-- Perfil / Login -->
            <div id="authContainer" class="flex items-center gap-3">
                <button id="btnLogin" onclick="loginGoogle()" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 transition-all" style="background-color: var(--primary);">
                    <span class="material-icons text-sm">login</span> Entrar com Google
                </button>
                <div id="userInfo" class="hidden items-center gap-2">
                    <span id="bureaucratBadge" class="hidden px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-amber-950 uppercase tracking-wider">
                        ★ Burocrata
                    </span>
                    <span id="userName" class="text-xs font-semibold"></span>
                    <button onclick="logout()" class="text-xs text-slate-400 hover:text-white ml-2">Sair</button>
                </div>
            </div>
        </div>
    </header>

    <!-- CONTEÚDO PRINCIPAL -->
    <main class="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Barra Lateral: Informações da Instância e Painel de Burocrata -->
        <aside class="md:col-span-1 space-y-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 class="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span class="material-icons text-base text-blue-600">shield</span> Governança da Wiki
                </h3>
                <p class="text-xs text-slate-500 leading-relaxed">
                    Esta instância alternativa é gerenciada pelo <strong>Burocrata</strong> configurado no código.
                </p>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                    <span class="font-semibold text-slate-700 block">Burocrata Principal:</span>
                    <span class="font-mono text-blue-600 font-bold block truncate">${bureaucratEmail || bureaucratUid}</span>
                    <span class="text-slate-400 text-[10px]">UID: ${bureaucratUid}</span>
                </div>
            </div>

            <!-- Painel Exclusivo do Burocrata -->
            <div id="bureaucratAdminPanel" class="hidden bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-3 text-xs text-amber-900">
                <h4 class="font-bold flex items-center gap-1.5 text-amber-950">
                    <span class="material-icons text-base">verified_user</span> Ações de Burocrata
                </h4>
                <p class="text-[11px] text-amber-800">Você possui permissões de nível máximo nesta Wiki.</p>
                <div class="space-y-1.5">
                    <button onclick="alert('Modo de edição irrestrita ativado')" class="w-full py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700">
                        Gerenciar Permissões da Wiki
                    </button>
                    <button onclick="alert('Painel de logs do Firestore aberto')" class="w-full py-1.5 rounded-lg bg-white border border-amber-300 font-medium hover:bg-amber-100">
                        Ver Artigos Protegidos
                    </button>
                </div>
            </div>
        </aside>

        <!-- Artigos e Feed -->
        <section class="md:col-span-2 space-y-4">
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-lg font-bold text-slate-900">Artigos e Verbetes</h2>
                        <p class="text-xs text-slate-500">Coleção: <code>${articlesCollection}</code></p>
                    </div>
                    <button id="btnNewArticle" onclick="createNewArticle()" class="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1" style="background-color: var(--primary);">
                        <span class="material-icons text-sm">add</span> Novo Artigo
                    </button>
                </div>

                <div id="articlesList" class="space-y-3 pt-2">
                    <div class="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Artigo Inicial</span>
                        <h4 class="font-bold text-sm text-slate-800">Bem-vindo à ${wikiTitle}</h4>
                        <p class="text-xs text-slate-600 leading-relaxed">
                            Esta é uma instalação personalizada do projeto <strong>Wiki-alternative</strong> (GitHub: WazzimaGiygg/Wiki-alternative).
                            As credenciais de Burocrata e a base de dados Firebase foram injetadas com sucesso.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- CONFIGURAÇÕES INJETADAS DA INSTÂNCIA -->
    <script>
        // ==========================================
        // 1. CONFIGURAÇÃO DO FIREBASE (GERADA)
        // ==========================================
        const firebaseConfig = {
            apiKey: "${fbApiKey}",
            authDomain: "${fbAuthDomain}",
            projectId: "${fbProjectId}",
            storageBucket: "${fbStorageBucket}",
            messagingSenderId: "${fbMessagingSenderId}",
            appId: "${fbAppId}"
        };

        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();

        // ==========================================
        // 2. REGRAS DE BUROCRATA (MODIFICADO)
        // ==========================================
        const BUROCRATAS_UIDS = ${JSON.stringify(allUids)};
        const BUROCRATAS_EMAILS = ${JSON.stringify(allEmails)};
        const ALLOW_PUBLIC_EDITING = ${allowPublicEditing};
        const ARTICLES_COLLECTION = "${articlesCollection}";

        let currentUser = null;
        let isBureaucrat = false;

        function checkIsBureaucrat(user) {
            if (!user) return false;
            const matchesUid = BUROCRATAS_UIDS.includes(user.uid);
            const matchesEmail = user.email && BUROCRATAS_EMAILS.includes(user.email.toLowerCase());
            return matchesUid || matchesEmail;
        }

        // ==========================================
        // 3. AUTENTICAÇÃO E GOVERNANÇA
        // ==========================================
        async function loginGoogle() {
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                await auth.signInWithPopup(provider);
            } catch (err) {
                alert("Erro ao fazer login: " + err.message);
            }
        }

        async function logout() {
            await auth.signOut();
        }

        auth.onAuthStateChanged((user) => {
            currentUser = user;
            const btnLogin = document.getElementById("btnLogin");
            const userInfo = document.getElementById("userInfo");
            const userName = document.getElementById("userName");
            const bureaucratBadge = document.getElementById("bureaucratBadge");
            const bureaucratAdminPanel = document.getElementById("bureaucratAdminPanel");

            if (user) {
                btnLogin.classList.add("hidden");
                userInfo.classList.remove("hidden");
                userInfo.classList.add("flex");
                userName.textContent = user.displayName || user.email;

                isBureaucrat = checkIsBureaucrat(user);
                if (isBureaucrat) {
                    bureaucratBadge.classList.remove("hidden");
                    bureaucratAdminPanel.classList.remove("hidden");
                    console.log("👑 Usuário reconhecido como BUROCRATA com plenos poderes!");
                } else {
                    bureaucratBadge.classList.add("hidden");
                    bureaucratAdminPanel.classList.add("hidden");
                }
            } else {
                btnLogin.classList.remove("hidden");
                userInfo.classList.add("hidden");
                userInfo.classList.remove("flex");
                bureaucratBadge.classList.add("hidden");
                bureaucratAdminPanel.classList.add("hidden");
            }
        });

        function createNewArticle() {
            if (!currentUser) {
                alert("Faça login para criar artigos na Wiki.");
                return;
            }
            if (!ALLOW_PUBLIC_EDITING && !isBureaucrat) {
                alert("Apenas o Burocrata possui autorização para criar novos artigos nesta instância.");
                return;
            }
            const title = prompt("Título do artigo:");
            if (!title) return;
            const content = prompt("Conteúdo do artigo:");
            if (!content) return;

            db.collection(ARTICLES_COLLECTION).add({
                titulo: title,
                conteudo: content,
                autorNome: currentUser.displayName || "Usuário",
                autorEmail: currentUser.email,
                autorUid: currentUser.uid,
                isBurocrata: isBureaucrat,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                alert("Artigo publicado com sucesso!");
            }).catch(err => {
                console.error(err);
                alert("Artigo salvo localmente (para persistência no Firestore, verifique as regras de segurança).");
            });
        }
    </script>
</body>
</html>`;
  };

  const handleDownloadFile = () => {
    const code = generateModifiedHtmlCode();
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wiki-alternative-${wikiTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadConfigOnly = () => {
    const configObject = {
      wikiTitle,
      wikiSubtitle,
      primaryColor,
      bureaucrats: {
        uids: [bureaucratUid, ...additionalBureaucrats.split(',').map((s) => s.trim())].filter(Boolean),
        emails: [bureaucratEmail].filter(Boolean)
      },
      firebase: {
        apiKey: fbApiKey,
        authDomain: fbAuthDomain,
        projectId: fbProjectId,
        storageBucket: fbStorageBucket,
        messagingSenderId: fbMessagingSenderId,
        appId: fbAppId
      },
      articlesCollection,
      allowPublicEditing,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(configObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wiki-config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateModifiedHtmlCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveAndConfirm = async () => {
    setSaving(true);
    try {
      if (!user) {
        alert('Faça login para salvar suas configurações na conta.');
        setSaving(false);
        return;
      }

      // Register the product acquisition if not already registered
      const purchase = await registerPurchase(user, product, 'gratuito');

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Also trigger file download automatically
      handleDownloadFile();

      onSuccess(purchase);
      onClose();
    } catch (err) {
      console.error('Error saving wiki configuration:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-sky-400 shadow-md">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Configurador Wiki-alternative</h2>
                <a
                  href="https://github.com/WazzimaGiygg/Wiki-alternative"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-white/10 px-2 py-0.5 rounded-md transition-colors"
                >
                  <Github className="w-3 h-3" />
                  GitHub: WazzimaGiygg/Wiki-alternative
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-xs text-slate-400">
                Adesão Básico WikiWorldWeb • Personalize quem é o Burocrata, Firebase e baixe o código modificado
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveStep('bureaucrat')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeStep === 'bureaucrat'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            1. Definir Burocrata (Admin)
          </button>

          <button
            onClick={() => setActiveStep('firebase')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeStep === 'firebase'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            2. Configurações Firebase
          </button>

          <button
            onClick={() => setActiveStep('wiki')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeStep === 'wiki'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            3. Identidade da Wiki
          </button>

          <button
            onClick={() => setActiveStep('preview')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeStep === 'preview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-600" />
            4. Código Modificado &amp; Download
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Bureaucrat */}
          {activeStep === 'bureaucrat' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1 text-xs">
                <span className="font-bold flex items-center gap-1.5 text-sm text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Quem é o Burocrata?
                </span>
                <p className="leading-relaxed text-amber-800">
                  No repositório <strong>Wiki-alternative</strong>, o Burocrata é a autoridade máxima da instância:
                  ele pode gerenciar artigos bloqueados, moderar usuários e definir permissões.
                  Você pode atribuir o cargo via <strong>E-mail Google</strong> e/ou <strong>UID Firebase</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Bureaucrat Email */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      E-mail Google do Burocrata
                    </label>
                    {user?.email && (
                      <button
                        type="button"
                        onClick={() => setBureaucratEmail(user.email)}
                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        Usar meu e-mail atual
                      </button>
                    )}
                  </div>
                  <input
                    type="email"
                    value={bureaucratEmail}
                    onChange={(e) => setBureaucratEmail(e.target.value)}
                    placeholder="ex: admin@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    O usuário que fizer login com este e-mail receberá automaticamente o badge e poderes de Burocrata.
                  </p>
                </div>

                {/* Primary Bureaucrat UID */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      UID Google/Firebase do Burocrata
                    </label>
                    {user?.uid && (
                      <button
                        type="button"
                        onClick={() => setBureaucratUid(user.uid)}
                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        Usar meu UID atual
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={bureaucratUid}
                    onChange={(e) => setBureaucratUid(e.target.value)}
                    placeholder="ex: sZxfMuOBPbXdR8nttVPXIN8QOOl1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Identificador único do usuário no Firebase Auth.
                  </p>
                </div>
              </div>

              {/* Additional Bureaucrats */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">
                  Outros UIDs ou E-mails de Burocratas (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={additionalBureaucrats}
                  onChange={(e) => setAdditionalBureaucrats(e.target.value)}
                  placeholder="ex: 6aPqWVh8JVYL5NqEb78iDGPD7dH3, outro@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-500">
                  Permite definir uma junta de múltiplos burocratas ou co-administradores da Wiki.
                </p>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setActiveStep('firebase')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Continuar para o Firebase →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Firebase Settings */}
          {activeStep === 'firebase' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Origem das Credenciais Firebase
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Escolha se deseja usar o Firebase oficial da WikiWorldWeb ou apontar para o seu próprio projeto.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFirebaseSource('default');
                      setFbApiKey(defaultFirebaseConfig.apiKey);
                      setFbAuthDomain(defaultFirebaseConfig.authDomain);
                      setFbProjectId(defaultFirebaseConfig.projectId);
                      setFbStorageBucket(defaultFirebaseConfig.storageBucket);
                      setFbMessagingSenderId(defaultFirebaseConfig.messagingSenderId);
                      setFbAppId(defaultFirebaseConfig.appId);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      firebaseSource === 'default'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Padrão WikiWorldWeb
                  </button>
                  <button
                    type="button"
                    onClick={() => setFirebaseSource('custom')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      firebaseSource === 'custom'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Personalizado
                  </button>
                </div>
              </div>

              {/* Firebase Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    API Key (apiKey)
                  </label>
                  <input
                    type="text"
                    value={fbApiKey}
                    disabled={firebaseSource === 'default'}
                    onChange={(e) => setFbApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Project ID (projectId)
                  </label>
                  <input
                    type="text"
                    value={fbProjectId}
                    disabled={firebaseSource === 'default'}
                    onChange={(e) => setFbProjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Auth Domain (authDomain)
                  </label>
                  <input
                    type="text"
                    value={fbAuthDomain}
                    disabled={firebaseSource === 'default'}
                    onChange={(e) => setFbAuthDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Storage Bucket (storageBucket)
                  </label>
                  <input
                    type="text"
                    value={fbStorageBucket}
                    disabled={firebaseSource === 'default'}
                    onChange={(e) => setFbStorageBucket(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Messaging Sender ID
                  </label>
                  <input
                    type="text"
                    value={fbMessagingSenderId}
                    disabled={firebaseSource === 'default'}
                    onChange={(e) => setFbMessagingSenderId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    App ID (appId)
                  </label>
                  <input
                    type="text"
                    value={fbAppId}
                    disabled={firebaseSource === 'default'}
                    onChange={(e) => setFbAppId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setActiveStep('bureaucrat')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  ← Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('wiki')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Continuar para Identidade da Wiki →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Wiki Identity & Permissions */}
          {activeStep === 'wiki' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Título / Nome da Wiki
                  </label>
                  <input
                    type="text"
                    value={wikiTitle}
                    onChange={(e) => setWikiTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Subtítulo / Slogan
                  </label>
                  <input
                    type="text"
                    value={wikiSubtitle}
                    onChange={(e) => setWikiSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Theme color presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Cor Primária do Tema
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { id: 'blue', label: 'Azul Wiki', color: '#2563eb' },
                    { id: 'emerald', label: 'Esmeralda', color: '#059669' },
                    { id: 'purple', label: 'Púrpura', color: '#7c3aed' },
                    { id: 'amber', label: 'Âmbar', color: '#d97706' },
                    { id: 'slate', label: 'Grafite', color: '#1e293b' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id as any)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        themePreset === p.id
                          ? 'border-slate-800 ring-2 ring-slate-800 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions & Collections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Coleção Firestore de Artigos
                  </label>
                  <input
                    type="text"
                    value={articlesCollection}
                    onChange={(e) => setArticlesCollection(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Permissões de Edição
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowPublicEditing}
                      onChange={(e) => setAllowPublicEditing(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Permitir que qualquer membro autenticado crie/edite artigos</span>
                  </label>
                  <p className="text-[10px] text-slate-500">
                    Se desmarcado, apenas os Burocratas autorizados poderão publicar novos artigos.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setActiveStep('firebase')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  ← Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('preview')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Gerar Código &amp; Prévia →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Preview, Code & Download */}
          {activeStep === 'preview' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Summary Badges */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                      Instância Pronta para Download
                    </span>
                    <h4 className="text-base font-bold text-white">{wikiTitle}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadConfigOnly}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar JSON Config</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Burocrata</span>
                    <span className="font-semibold text-amber-300 truncate block">
                      {bureaucratEmail || bureaucratUid}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Firebase Project</span>
                    <span className="font-mono text-slate-300">{fbProjectId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Edição Pública</span>
                    <span className="text-emerald-400 font-semibold">
                      {allowPublicEditing ? 'Habilitada' : 'Apenas Burocrata'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Repositório Base</span>
                    <span className="text-sky-300 font-semibold">Wiki-alternative</span>
                  </div>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
                  <span>index.html modificado (Repositório Wiki-alternative)</span>
                  <span>HTML + JS + Firebase Compat</span>
                </div>
                <pre className="p-4 bg-slate-950 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed select-all">
                  {generateModifiedHtmlCode()}
                </pre>
              </div>

              {/* Download & Save CTA */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">
                    Baixe e execute no seu servidor ou navegador
                  </h5>
                  <p className="text-xs text-slate-600 mt-0.5">
                    O arquivo gerado já contém o Burocrata definido, chaves do Firebase injetadas e
                    está 100% pronto para uso.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadFile}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Baixar Arquivo HTML</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveAndConfirm}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Salvando...' : 'Salvar & Confirmar'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <Github className="w-4 h-4 text-slate-700" />
            Base: github.com/WazzimaGiygg/Wiki-alternative
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200 font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
