import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  auth,
  syncUserProfile,
  fetchProducts,
  fetchUserPurchases,
  fetchNotifications,
  fetchCloudExtensions,
  subscribeToCloudExtensions,
  isGoogleAiStudio,
  DEFAULT_EXTENSIONS
} from './firebase';
import { Product, Purchase, UserProfile, AppNotification, ExtensionConfig } from './types';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';
import { MyProductsView } from './components/MyProductsView';
import { NotificationsModal } from './components/NotificationsModal';
import { AdminModal } from './components/AdminModal';
import { LoginModal } from './components/LoginModal';
import { WikiConfiguratorModal } from './components/WikiConfiguratorModal';
import { ExtensionsManagerModal } from './components/ExtensionsManagerModal';
import { SecurityLockScreen } from './components/SecurityLockScreen';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Gift,
  HelpCircle,
  ExternalLink,
  Zap,
  Globe2,
  Users
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-products'>('catalog');

  // Products & Purchases
  const [products, setProducts] = useState<Product[]>([]);
  const [userPurchases, setUserPurchases] = useState<Purchase[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Filters & Search
  const [filterType, setFilterType] = useState<'all' | 'gratuito' | 'pago' | 'meus'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'popular' | 'name'>('popular');

  // Modals
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<Purchase | null>(null);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [wikiConfiguratorOpen, setWikiConfiguratorOpen] = useState(false);
  const [wikiConfigProduct, setWikiConfigProduct] = useState<Product | null>(null);

  // Cloud Extensions & Security Guard
  const [extensions, setExtensions] = useState<ExtensionConfig[]>(DEFAULT_EXTENSIONS);
  const [syncedWithCloud, setSyncedWithCloud] = useState<boolean>(true);
  const [loadingExtensions, setLoadingExtensions] = useState<boolean>(true);
  const [isRetryingSync, setIsRetryingSync] = useState<boolean>(false);
  const [extensionsModalOpen, setExtensionsModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    loadProductsList();
    loadExtensions();

    // Inscrição em tempo real para atualizações de extensões da nuvem
    const unsubExtensions = subscribeToCloudExtensions((newExts, isSynced) => {
      setExtensions(newExts);
      setSyncedWithCloud(isSynced);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          if (profile.isBanned) {
            showToast('🚫 Sua conta está bloqueada pelo administrador.', 'error');
            await signOut(auth);
            setCurrentUser(null);
            return;
          }
          setCurrentUser(profile);
          await loadUserData(profile.uid);
        } catch (err) {
          console.error('Error handling auth state change:', err);
        }
      } else {
        // Keep demo or logged out state
        setCurrentUser((prev) => (prev?.uid?.startsWith('demo-') ? prev : null));
        if (!currentUser?.uid?.startsWith('demo-')) {
          setUserPurchases([]);
          setNotifications([]);
        }
      }
      setLoadingAuth(false);
    });

    return () => {
      unsubscribe();
      unsubExtensions();
    };
  }, []);

  const loadExtensions = async () => {
    setLoadingExtensions(true);
    const result = await fetchCloudExtensions();
    setExtensions(result.extensions);
    setSyncedWithCloud(result.syncedWithCloud);
    setLoadingExtensions(false);
  };

  const handleRetrySync = async () => {
    setIsRetryingSync(true);
    const result = await fetchCloudExtensions();
    setExtensions(result.extensions);
    setSyncedWithCloud(result.syncedWithCloud);
    setIsRetryingSync(false);
    if (result.syncedWithCloud) {
      showToast('✅ Extensões sincronizadas com sucesso com o Firebase!', 'success');
    } else {
      showToast('❌ Falha ao sincronizar com o Firebase. Tente novamente.', 'error');
    }
  };

  const loadProductsList = async () => {
    setLoadingProducts(true);
    const data = await fetchProducts();
    setProducts(data);
    setLoadingProducts(false);
  };

  const loadUserData = async (uid: string) => {
    try {
      const [purchases, notifs] = await Promise.all([
        fetchUserPurchases(uid),
        fetchNotifications(uid)
      ]);
      setUserPurchases(purchases);
      setNotifications(notifs);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserPurchases([]);
      setNotifications([]);
      showToast('👋 Você saiu da sua conta com sucesso.', 'info');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const primaryExtension = extensions.find((e) => e.id === 'ext_servicos_disponibilidade');

  const isProductDisabled = (productId: string): boolean => {
    if (!primaryExtension || !primaryExtension.ativo) return false;
    if (primaryExtension.modoManutencaoGeral) return true;
    if (
      primaryExtension.servicosDisponiveis &&
      primaryExtension.servicosDisponiveis[productId] === false
    ) {
      return true;
    }
    return false;
  };

  const handleSelectProduct = (product: Product) => {
    if (isProductDisabled(product.id)) {
      showToast('⚠️ Este serviço foi desabilitado pelos administradores no Firebase.', 'error');
      return;
    }
    if (!currentUser) {
      showToast('⚠️ Faça login ou acesse como visitante para adquirir produtos.', 'info');
      setLoginModalOpen(true);
      return;
    }
    // Ao selecionar Acesso Básico, abre o configurador do repositório Wiki-alternative
    if (product.id === 'prod_free_01') {
      setWikiConfigProduct(product);
      setWikiConfiguratorOpen(true);
      return;
    }
    setSelectedProduct(product);
    setCheckoutModalOpen(true);
  };

  const handleOpenWikiConfig = (product: Product) => {
    if (isProductDisabled(product.id)) {
      showToast('⚠️ Este serviço foi desabilitado pelos administradores no Firebase.', 'error');
      return;
    }
    if (!currentUser) {
      showToast('⚠️ Faça login ou acesse como visitante para configurar e baixar sua Wiki.', 'info');
      setLoginModalOpen(true);
      return;
    }
    setWikiConfigProduct(product);
    setWikiConfiguratorOpen(true);
  };

  const handlePurchaseSuccess = async (purchase: Purchase) => {
    setCheckoutModalOpen(false);
    setLastPurchase(purchase);
    setReceiptModalOpen(true);

    showToast(
      purchase.isFree
        ? '🎉 Produto adquirido com sucesso!'
        : '💳 Pagamento confirmado! Licença liberada.',
      'success'
    );

    if (currentUser) {
      await loadUserData(currentUser.uid);
    }
  };

  const isProductOwned = (productId: string) => {
    return userPurchases.some((p) => p.productId === productId);
  };

  const handleViewLicense = (product: Product) => {
    const purchase = userPurchases.find((p) => p.productId === product.id);
    if (purchase) {
      setLastPurchase(purchase);
      setReceiptModalOpen(true);
    } else {
      setActiveTab('my-products');
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
    showToast('Notificações marcadas como lidas.', 'info');
  };

  // Filtering products
  const categories = ['Todas', ...Array.from(new Set(products.map((p) => p.categoria || 'Geral')))];

  const filteredProducts = products
    .filter((product) => {
      // Free / Paid / Owned tab filter
      if (filterType === 'gratuito' && (product.preco > 0 || product.tipo === 'pago')) {
        return false;
      }
      if (filterType === 'pago' && (product.preco === 0 || product.tipo === 'gratuito')) {
        return false;
      }
      if (filterType === 'meus' && !isProductOwned(product.id)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'Todas' && product.categoria !== selectedCategory) {
        return false;
      }

      // Text Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = product.nome.toLowerCase().includes(term);
        const matchesDesc = product.descricao.toLowerCase().includes(term);
        const matchesCat = product.categoria?.toLowerCase().includes(term);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.preco - b.preco;
      if (sortBy === 'price-desc') return b.preco - a.preco;
      if (sortBy === 'name') return a.nome.localeCompare(b.nome);
      // 'popular'
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return 0;
    });

  const inAiStudio = isGoogleAiStudio();
  const isSecurityBlocked = !syncedWithCloud && !inAiStudio;

  if (isSecurityBlocked) {
    return (
      <SecurityLockScreen
        onRetrySync={handleRetrySync}
        onOpenLogin={() => setLoginModalOpen(true)}
        isRetrying={isRetryingSync}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Google AI Studio Environment Notice */}
      {inAiStudio && (
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-sky-200 text-xs px-4 py-2 border-b border-indigo-900/60 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white">Google AI Studio Build:</span>
              <span className="text-[11px] sm:text-xs">
                Acesso irrestrito ativo para manipulação de código e manutenção de extensões.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-300">
                Nuvem Firebase:{' '}
                <strong className={syncedWithCloud ? 'text-emerald-400' : 'text-amber-400'}>
                  {syncedWithCloud ? 'Sincronizada' : 'Modo Local'}
                </strong>
              </span>
              <button
                onClick={handleRetrySync}
                className="px-2.5 py-0.5 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] font-bold transition-colors"
              >
                Re-sincronizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 py-3 px-5 rounded-2xl shadow-2xl text-white font-medium text-xs sm:text-sm flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 border-emerald-500 shadow-emerald-500/20'
              : toastMessage.type === 'error'
              ? 'bg-rose-600 border-rose-500 shadow-rose-500/20'
              : 'bg-slate-900 border-slate-800 shadow-slate-900/30'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-200" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenExtensions={() => setExtensionsModalOpen(true)}
        notifications={notifications}
        purchasedCount={userPurchases.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'my-products' ? (
          <MyProductsView
            purchases={userPurchases}
            allProducts={products}
            onExploreCatalog={() => setActiveTab('catalog')}
            onOpenReceipt={(purchase) => {
              setLastPurchase(purchase);
              setReceiptModalOpen(true);
            }}
            onConfigureWiki={handleOpenWikiConfig}
          />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Hero Section */}
            <section className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 overflow-hidden shadow-2xl border border-slate-800">
              {/* Background ambient lighting */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Central Oficial de Produtos &amp; Serviços
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                  Eleve sua experiência na{' '}
                  <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                    WikiWorldWeb
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                  Adquira serviços gratuitos ou pacotes Maribondo para expandir sua pesquisa,
                  colaboração e automação. Liberação imediata com comprovante e chave de licença.
                </p>

                {/* Trust Badges */}
                <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" /> Ativação em tempo real
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Transações 100% Seguras
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Globe2 className="w-4 h-4 text-sky-400" /> Base Oficial WikiWorldWeb
                  </span>
                </div>
              </div>
            </section>

            {/* Filter & Search Bar */}
            <div className="space-y-4">
              {/* Main Tabs (Matches user requirements: Todos, Gratuitos, Pagos, Meus) */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      filterType === 'all'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    Todos os Produtos ({products.length})
                  </button>
                  <button
                    onClick={() => setFilterType('gratuito')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      filterType === 'gratuito'
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    Gratuitos
                  </button>
                  <button
                    onClick={() => setFilterType('pago')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      filterType === 'pago'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    Pagos / Maribondo
                  </button>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        showToast('Faça login para ver seus produtos adquiridos', 'info');
                        setLoginModalOpen(true);
                      } else {
                        setFilterType('meus');
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      filterType === 'meus'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    Meus Produtos ({userPurchases.length})
                  </button>
                </div>

                {/* Search & Sort */}
                <div className="flex items-center gap-2.5">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Pesquisar produto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="py-2 px-3 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium shrink-0"
                  >
                    <option value="popular">Destaques &amp; Populares</option>
                    <option value="price-asc">Menor Preço</option>
                    <option value="price-desc">Maior Preço</option>
                    <option value="name">Ordem Alfabética</option>
                  </select>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 font-semibold pr-1.5 shrink-0">Categorias:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500 font-medium">Carregando catálogo de produtos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Nenhum produto encontrado</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Não encontramos produtos com os filtros selecionados. Tente limpar a busca ou
                  selecionar outra categoria.
                </p>
                <button
                  onClick={() => {
                    setFilterType('all');
                    setSelectedCategory('Todas');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors"
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isOwned={isProductOwned(product.id)}
                    onSelect={handleSelectProduct}
                    onViewLicense={handleViewLicense}
                    onConfigureWiki={handleOpenWikiConfig}
                    isDisabledByExtension={isProductDisabled(product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              🌐
            </div>
            <div>
              <p className="font-bold text-slate-200 text-sm">WikiWorldWeb</p>
              <p className="text-[11px] text-slate-400">
                Central de Produtos e Serviços • Versão 2.4 Oficial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <a
              href="https://wzzm-ce3fc.firebaseapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Acessar Wiki</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>Segurança Firebase Firestore</span>
            <span>Termos de Uso</span>
          </div>

          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} WikiWorldWeb. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        product={selectedProduct}
        user={currentUser || ({} as UserProfile)}
        onClose={() => setCheckoutModalOpen(false)}
        onSuccess={handlePurchaseSuccess}
        onConfigureWiki={handleOpenWikiConfig}
      />

      <ReceiptModal
        isOpen={receiptModalOpen}
        purchase={lastPurchase}
        onClose={() => setReceiptModalOpen(false)}
        onViewLibrary={() => {
          setActiveTab('my-products');
        }}
      />

      <NotificationsModal
        isOpen={notificationsModalOpen}
        notifications={notifications}
        onClose={() => setNotificationsModalOpen(false)}
        onMarkAllRead={handleMarkAllRead}
      />

      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onProductCreated={() => {
          loadProductsList();
          showToast('Produto adicionado ao catálogo!', 'success');
        }}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          loadUserData(user.uid);
          showToast(`Bem-vindo(a), ${user.name}!`, 'success');
        }}
      />

      {wikiConfigProduct && (
        <WikiConfiguratorModal
          isOpen={wikiConfiguratorOpen}
          product={wikiConfigProduct}
          user={currentUser}
          onClose={() => setWikiConfiguratorOpen(false)}
          onSuccess={(purchase) => {
            handlePurchaseSuccess(purchase);
          }}
        />
      )}

      <ExtensionsManagerModal
        isOpen={extensionsModalOpen}
        onClose={() => setExtensionsModalOpen(false)}
        extensions={extensions}
        products={products}
        currentUser={currentUser}
        syncedWithCloud={syncedWithCloud}
        onExtensionUpdated={(updated) => {
          setExtensions(updated);
        }}
      />
    </div>
  );
}
