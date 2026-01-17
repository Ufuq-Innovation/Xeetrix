"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { 
  Megaphone, 
  Target, 
  BarChart3, 
  Users, 
  Mail, 
  MessageSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  Image,
  Video,
  FileText,
  Edit2,
  Trash2,
  Eye,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Filter,
  Search,
  RefreshCw,
  Loader2,
  Download,
  Upload,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  Share2,
  Copy,
  Link,
  QrCode,
  Palette,
  Layout,
  Settings,
  Zap,
  Bell
} from "lucide-react";

export default function MarketingPage() {
  const { t } = useTranslation("common");
  const { lang, currency } = useApp();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState("campaigns"); // campaigns, content, analytics, templates
  const [campaigns, setCampaigns] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [devicePreview, setDevicePreview] = useState("desktop"); // mobile, tablet, desktop

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    type: "email", // email, sms, social, push, banner
    targetAudience: "all", // all, vip, new, inactive
    budget: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    status: "draft", // draft, active, paused, completed
    description: "",
    template: "",
    scheduleType: "immediate", // immediate, scheduled, recurring
    recurrence: "once", // once, daily, weekly, monthly
    channels: ["email"]
  });

  // Content form state
  const [contentForm, setContentForm] = useState({
    title: "",
    type: "banner", // banner, popup, notification, hero, testimonial, blog
    content: "",
    position: "top", // top, bottom, sidebar, center, fullscreen
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
    buttonText: "Learn More",
    buttonColor: "#10b981",
    buttonLink: "",
    imageUrl: "",
    videoUrl: "",
    status: "draft", // draft, active, scheduled, archived
    scheduleDate: new Date().toISOString().split('T')[0],
    devices: ["desktop", "mobile"], // desktop, mobile, tablet
    pages: ["home"], // home, product, cart, checkout, blog
    priority: 1, // 1-10
    impressions: 0,
    clicks: 0
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    type: "email", // email, banner, popup, sms, social
    category: "promotional", // promotional, informational, transactional, seasonal
    content: "",
    styles: {},
    variables: [],
    previewImage: "",
    isPublic: false
  });

  // Stats state
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalContent: 0,
    activeContent: 0,
    totalImpressions: 0,
    totalClicks: 0,
    clickRate: 0,
    totalBudget: 0,
    spentBudget: 0
  });

  /* ===================== FETCH DATA ===================== */
  const fetchMarketingData = async () => {
    try {
      setFetching(true);
      
      const [campaignsRes, contentRes, analyticsRes, templatesRes] = await Promise.all([
        fetch("/api/marketing/campaigns"),
        fetch("/api/marketing/content"),
        fetch("/api/marketing/analytics"),
        fetch("/api/marketing/templates")
      ]);

      const campaignsData = await campaignsRes.json();
      const contentData = await contentRes.json();
      const analyticsData = await analyticsRes.json();
      const templatesData = await templatesRes.json();

      if (campaignsData.success) setCampaigns(campaignsData.campaigns || []);
      if (contentData.success) setContentItems(contentData.content || []);
      if (analyticsData.success) setAnalytics(analyticsData.analytics || {});
      if (templatesData.success) setTemplates(templatesData.templates || []);

      // Calculate stats
      const totalCampaigns = campaignsData.campaigns?.length || 0;
      const activeCampaigns = campaignsData.campaigns?.filter(c => c.status === 'active').length || 0;
      const totalContent = contentData.content?.length || 0;
      const activeContent = contentData.content?.filter(c => c.status === 'active').length || 0;
      const totalImpressions = contentData.content?.reduce((sum, c) => sum + (c.impressions || 0), 0) || 0;
      const totalClicks = contentData.content?.reduce((sum, c) => sum + (c.clicks || 0), 0) || 0;
      const clickRate = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
      const totalBudget = campaignsData.campaigns?.reduce((sum, c) => sum + (c.budget || 0), 0) || 0;
      const spentBudget = campaignsData.campaigns?.reduce((sum, c) => sum + (c.spent || 0), 0) || 0;

      setStats({
        totalCampaigns,
        activeCampaigns,
        totalContent,
        activeContent,
        totalImpressions,
        totalClicks,
        clickRate,
        totalBudget,
        spentBudget
      });

    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load marketing data");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMarketingData();
  }, [lang]);

  /* ===================== FORM HANDLERS ===================== */
  const handleCampaignInputChange = (e) => {
    const { name, value, type } = e.target;
    setCampaignForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? 
        (prev.channels.includes(value) 
          ? prev.channels.filter(ch => ch !== value)
          : [...prev.channels, value]
        ) : value
    }));
  };

  const handleContentInputChange = (e) => {
    const { name, value, type } = e.target;
    setContentForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? 
        (prev[name].includes(value)
          ? prev[name].filter(item => item !== value)
          : [...prev[name], value]
        ) : value
    }));
  };

  const handleTemplateInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTemplateForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /* ===================== CRUD OPERATIONS ===================== */
  // Campaign CRUD
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignForm)
      });
      
      const data = await res.json();
      
      if (!data.success) throw new Error(data.message);
      
      toast.success("Campaign created successfully");
      setShowCampaignForm(false);
      setCampaignForm({
        name: "", type: "email", targetAudience: "all", budget: "",
        startDate: new Date().toISOString().split('T')[0], endDate: "",
        status: "draft", description: "", template: "",
        scheduleType: "immediate", recurrence: "once", channels: ["email"]
      });
      await fetchMarketingData();
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCampaign = async (e) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    
    setLoading(true);
    
    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...campaignForm, id: selectedCampaign._id })
      });
      
      const data = await res.json();
      
      if (!data.success) throw new Error(data.message);
      
      toast.success("Campaign updated successfully");
      setShowCampaignForm(false);
      setSelectedCampaign(null);
      await fetchMarketingData();
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    
    try {
      const res = await fetch(`/api/marketing/campaigns?id=${id}`, {
        method: "DELETE"
      });
      
      const data = await res.json();
      
      if (!data.success) throw new Error(data.message);
      
      toast.success("Campaign deleted successfully");
      await fetchMarketingData();
      
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Content CRUD
  const handleCreateContent = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/marketing/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentForm)
      });
      
      const data = await res.json();
      
      if (!data.success) throw new Error(data.message);
      
      toast.success("Content created successfully");
      setShowContentForm(false);
      setContentForm({
        title: "", type: "banner", content: "", position: "top",
        backgroundColor: "#3b82f6", textColor: "#ffffff",
        buttonText: "Learn More", buttonColor: "#10b981", buttonLink: "",
        imageUrl: "", videoUrl: "", status: "draft",
        scheduleDate: new Date().toISOString().split('T')[0],
        devices: ["desktop", "mobile"], pages: ["home"],
        priority: 1, impressions: 0, clicks: 0
      });
      await fetchMarketingData();
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContent = async (e) => {
    e.preventDefault();
    if (!selectedContent) return;
    
    setLoading(true);
    
    try {
      const res = await fetch("/api/marketing/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contentForm, id: selectedContent._id })
      });
      
      const data = await res.json();
      
      if (!data.success) throw new Error(data.message);
      
      toast.success("Content updated successfully");
      setShowContentForm(false);
      setSelectedContent(null);
      await fetchMarketingData();
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (id) => {
    if (!confirm("Are you sure you want to delete this content?")) return;
    
    try {
      const res = await fetch(`/api/marketing/content?id=${id}`, {
        method: "DELETE"
      });
      
      const data = await res.json();
      
      if (!data.success) throw new Error(data.message);
      
      toast.success("Content deleted successfully");
      await fetchMarketingData();
      
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePreviewContent = (content) => {
    setPreviewContent(content);
    setShowPreview(true);
  };

  // Template CRUD
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/marketing/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateForm)
      });
      
      const data = await res.json();
      
      if (!data.success) throw new Error(data.message);
      
      toast.success("Template created successfully");
      setShowTemplateForm(false);
      setTemplateForm({
        name: "", type: "email", category: "promotional",
        content: "", styles: {}, variables: [],
        previewImage: "", isPublic: false
      });
      await fetchMarketingData();
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template) => {
    if (template.type === 'email') {
      setCampaignForm(prev => ({
        ...prev,
        template: template._id,
        description: template.content
      }));
      setActiveTab("campaigns");
      setShowCampaignForm(true);
    } else {
      setContentForm(prev => ({
        ...prev,
        type: template.type,
        content: template.content,
        backgroundColor: template.styles?.backgroundColor || "#3b82f6",
        textColor: template.styles?.textColor || "#ffffff"
      }));
      setActiveTab("content");
      setShowContentForm(true);
    }
    toast.success("Template applied");
  };

  /* ===================== STATS CARDS ===================== */
  const statsCards = [
    {
      label: "Active Campaigns",
      value: stats.activeCampaigns,
      icon: Megaphone,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      change: "+12%"
    },
    {
      label: "Active Content",
      value: stats.activeContent,
      icon: Image,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      change: "+8%"
    },
    {
      label: "Total Impressions",
      value: stats.totalImpressions.toLocaleString(),
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      change: "+24%"
    },
    {
      label: "Click Rate",
      value: `${stats.clickRate}%`,
      icon: BarChart3,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      change: "+5%"
    }
  ];

  /* ===================== QUICK ACTIONS ===================== */
  const quickActions = [
    {
      title: "Create Campaign",
      icon: Megaphone,
      color: "bg-blue-500",
      onClick: () => setShowCampaignForm(true)
    },
    {
      title: "Add Banner",
      icon: Image,
      color: "bg-green-500",
      onClick: () => {
        setContentForm(prev => ({ ...prev, type: "banner" }));
        setShowContentForm(true);
      }
    },
    {
      title: "Create Popup",
      icon: MessageSquare,
      color: "bg-purple-500",
      onClick: () => {
        setContentForm(prev => ({ ...prev, type: "popup" }));
        setShowContentForm(true);
      }
    },
    {
      title: "Email Blast",
      icon: Mail,
      color: "bg-red-500",
      onClick: () => {
        setCampaignForm(prev => ({ ...prev, type: "email" }));
        setShowCampaignForm(true);
      }
    }
  ];

  /* ===================== TABS ===================== */
  const tabs = [
    { id: "campaigns", label: "Campaigns", icon: Megaphone },
    { id: "content", label: "Content", icon: Image },
    { id: "templates", label: "Templates", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart3 }
  ];

  /* ===================== HELPER FUNCTIONS ===================== */
  const formatCurrency = (amount) => {
    const symbol = typeof currency === 'string' ? currency : 
                  (currency?.symbol || currency?.code || "৳");
    return `${symbol} ${Number(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500';
      case 'draft': return 'bg-yellow-500/10 text-yellow-500';
      case 'paused': return 'bg-orange-500/10 text-orange-500';
      case 'completed': return 'bg-blue-500/10 text-blue-500';
      case 'archived': return 'bg-gray-500/10 text-gray-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

const getTypeIcon = (type) => {
  switch (type) {
    case 'email': return <Mail size={14} />;
    case 'sms': return <MessageSquare size={14} />;
    case 'social': return <Share2 size={14} />;
    case 'push': return <Bell size={14} />;
    case 'banner': return <Image size={14} />;
    case 'popup': return <MessageSquare size={14} />;
    case 'notification': return <Bell size={14} />;
    default: return <FileText size={14} />;
  }
};

  /* ===================== LOADING STATE ===================== */
  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic">
              Marketing & Content Hub
            </h1>
            <p className="text-slate-400 mt-2">
              Manage campaigns, content, and visual elements in one place
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowTemplateForm(true)}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-2"
            >
              <FileText size={16} />
              New Template
            </button>
            
            <button
              onClick={fetchMarketingData}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl"
            >
              <RefreshCw size={16} className={fetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  {stat.change && (
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <TrendingUp size={12} />
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={stat.color} size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="bg-gray-900 p-5 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${action.color}`}>
                  <action.icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Click to create
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-800">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-blue-500 border-b-2 border-blue-500"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Campaigns Tab */}
            {activeTab === "campaigns" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Marketing Campaigns</h2>
                  <button
                    onClick={() => setShowCampaignForm(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2"
                  >
                    <PlusCircle size={16} />
                    New Campaign
                  </button>
                </div>

                {campaigns.length === 0 ? (
                  <div className="p-12 text-center">
                    <Megaphone className="mx-auto text-slate-600 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">
                      No Campaigns Yet
                    </h3>
                    <p className="text-slate-400 mb-6">
                      Create your first marketing campaign to get started
                    </p>
                    <button
                      onClick={() => setShowCampaignForm(true)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl"
                    >
                      Create Campaign
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {campaigns.map(campaign => (
                      <div key={campaign._id} className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-white text-lg">{campaign.name}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                {campaign.status}
                              </span>
                              <span className="text-sm text-slate-400">
                                {campaign.type.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedCampaign(campaign);
                                setCampaignForm({
                                  name: campaign.name,
                                  type: campaign.type,
                                  targetAudience: campaign.targetAudience,
                                  budget: campaign.budget,
                                  startDate: campaign.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
                                  endDate: campaign.endDate?.split('T')[0] || "",
                                  status: campaign.status,
                                  description: campaign.description,
                                  template: campaign.template,
                                  scheduleType: campaign.scheduleType,
                                  recurrence: campaign.recurrence,
                                  channels: campaign.channels || ["email"]
                                });
                                setShowCampaignForm(true);
                              }}
                              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCampaign(campaign._id)}
                              className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-slate-300 mb-4 text-sm">
                          {campaign.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-400">Budget</p>
                            <p className="font-bold text-white">{formatCurrency(campaign.budget || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Spent</p>
                            <p className="font-bold text-green-500">{formatCurrency(campaign.spent || 0)}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{formatDate(campaign.startDate)}</span>
                            {campaign.endDate && (
                              <>
                                <span>-</span>
                                <span>{formatDate(campaign.endDate)}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={12} />
                            <span>{campaign.targetAudience}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content Tab */}
            {activeTab === "content" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Content Management</h2>
                  <button
                    onClick={() => setShowContentForm(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2"
                  >
                    <PlusCircle size={16} />
                    New Content
                  </button>
                </div>

                {contentItems.length === 0 ? (
                  <div className="p-12 text-center">
                    <Image className="mx-auto text-slate-600 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">
                      No Content Yet
                    </h3>
                    <p className="text-slate-400 mb-6">
                      Create banners, popups, or notifications for your site
                    </p>
                    <button
                      onClick={() => setShowContentForm(true)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl"
                    >
                      Create Content
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left p-4 text-slate-400">Content</th>
                          <th className="text-left p-4 text-slate-400">Type</th>
                          <th className="text-left p-4 text-slate-400">Position</th>
                          <th className="text-left p-4 text-slate-400">Status</th>
                          <th className="text-left p-4 text-slate-400">Performance</th>
                          <th className="text-left p-4 text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contentItems.map(content => (
                          <tr key={content._id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                            <td className="p-4">
                              <div>
                                <h3 className="font-bold text-white">{content.title}</h3>
                                <p className="text-sm text-slate-400 mt-1 truncate max-w-[200px]">
                                  {content.content?.substring(0, 60)}...
                                </p>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                                {getTypeIcon(content.type)}
                                {content.type}
                              </span>
                            </td>
                            <td className="p-4 text-slate-300">
                              {content.position}
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                                {content.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="space-y-1">
                                <div className="flex gap-4 text-sm">
                                  <span className="text-slate-400">Impressions: {content.impressions || 0}</span>
                                  <span className="text-slate-400">Clicks: {content.clicks || 0}</span>
                                </div>
                                <div className="text-xs text-green-500">
                                  CTR: {content.impressions > 0 ? ((content.clicks / content.impressions) * 100).toFixed(2) : 0}%
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handlePreviewContent(content)}
                                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedContent(content);
                                    setContentForm({
                                      title: content.title,
                                      type: content.type,
                                      content: content.content,
                                      position: content.position,
                                      backgroundColor: content.backgroundColor,
                                      textColor: content.textColor,
                                      buttonText: content.buttonText,
                                      buttonColor: content.buttonColor,
                                      buttonLink: content.buttonLink,
                                      imageUrl: content.imageUrl,
                                      videoUrl: content.videoUrl,
                                      status: content.status,
                                      scheduleDate: content.scheduleDate?.split('T')[0] || new Date().toISOString().split('T')[0],
                                      devices: content.devices || ["desktop", "mobile"],
                                      pages: content.pages || ["home"],
                                      priority: content.priority || 1,
                                      impressions: content.impressions || 0,
                                      clicks: content.clicks || 0
                                    });
                                    setShowContentForm(true);
                                  }}
                                  className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteContent(content._id)}
                                  className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === "templates" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Content Templates</h2>
                  <button
                    onClick={() => setShowTemplateForm(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2"
                  >
                    <PlusCircle size={16} />
                    New Template
                  </button>
                </div>

                {templates.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="mx-auto text-slate-600 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">
                      No Templates Yet
                    </h3>
                    <p className="text-slate-400 mb-6">
                      Create reusable templates for campaigns and content
                    </p>
                    <button
                      onClick={() => setShowTemplateForm(true)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl"
                    >
                      Create Template
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                      <div key={template._id} className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-white">{template.name}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500">
                                {template.type}
                              </span>
                              <span className="text-sm text-slate-400">
                                {template.category}
                              </span>
                            </div>
                          </div>
                          {template.isPublic && (
                            <span className="text-xs text-green-500">Public</span>
                          )}
                        </div>
                        
                        <div className="mb-4 p-3 bg-gray-900 rounded-lg">
                          <div className="text-sm text-slate-300 line-clamp-3">
                            {template.content?.substring(0, 100)}...
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <button
                            onClick={() => handleUseTemplate(template)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                          >
                            Use Template
                          </button>
                          <button
                            onClick={() => {
                              setTemplateForm({
                                name: template.name,
                                type: template.type,
                                category: template.category,
                                content: template.content,
                                styles: template.styles,
                                variables: template.variables,
                                previewImage: template.previewImage,
                                isPublic: template.isPublic
                              });
                              setSelectedContent(template);
                              setShowTemplateForm(true);
                            }}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div>
                <h2 className="text-xl font-bold mb-6">Marketing Analytics</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Campaign Performance */}
                  <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700">
                    <h3 className="font-bold text-white mb-4">Campaign Performance</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-slate-400">Budget Utilization</span>
                          <span className="text-sm font-bold">
                            {stats.totalBudget > 0 ? ((stats.spentBudget / stats.totalBudget) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${stats.totalBudget > 0 ? (stats.spentBudget / stats.totalBudget) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Active Campaigns</p>
                          <p className="text-2xl font-bold text-white">{stats.activeCampaigns}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Total Budget</p>
                          <p className="text-2xl font-bold text-green-500">{formatCurrency(stats.totalBudget)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Performance */}
                  <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700">
                    <h3 className="font-bold text-white mb-4">Content Performance</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-slate-400">Click Through Rate</span>
                          <span className="text-sm font-bold">{stats.clickRate}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.min(stats.clickRate, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Total Impressions</p>
                          <p className="text-2xl font-bold text-white">{stats.totalImpressions.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-400">Total Clicks</p>
                          <p className="text-2xl font-bold text-green-500">{stats.totalClicks.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance by Type */}
                <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700">
                  <h3 className="font-bold text-white mb-4">Performance by Content Type</h3>
                  <div className="space-y-3">
                    {['banner', 'popup', 'notification', 'email'].map(type => {
                      const typeItems = contentItems.filter(c => c.type === type);
                      const typeImpressions = typeItems.reduce((sum, c) => sum + (c.impressions || 0), 0);
                      const typeClicks = typeItems.reduce((sum, c) => sum + (c.clicks || 0), 0);
                      const ctr = typeImpressions > 0 ? (typeClicks / typeImpressions * 100).toFixed(2) : 0;
                      
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-700 rounded-lg">
                              {getTypeIcon(type)}
                            </div>
                            <span className="font-medium text-white capitalize">{type}s</span>
                          </div>
                          <div className="flex gap-6">
                            <span className="text-sm text-slate-400">Impr: {typeImpressions.toLocaleString()}</span>
                            <span className="text-sm text-slate-400">Clicks: {typeClicks.toLocaleString()}</span>
                            <span className="text-sm text-green-500">CTR: {ctr}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Form Modal */}
      {showCampaignForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {selectedCampaign ? "Edit Campaign" : "New Campaign"}
                </h2>
                <button
                  onClick={() => {
                    setShowCampaignForm(false);
                    setSelectedCampaign(null);
                    setCampaignForm({
                      name: "", type: "email", targetAudience: "all", budget: "",
                      startDate: new Date().toISOString().split('T')[0], endDate: "",
                      status: "draft", description: "", template: "",
                      scheduleType: "immediate", recurrence: "once", channels: ["email"]
                    });
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={selectedCampaign ? handleUpdateCampaign : handleCreateCampaign}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Campaign Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={campaignForm.name}
                      onChange={handleCampaignInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      placeholder="Summer Sale 2024"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Type *</label>
                      <select
                        name="type"
                        value={campaignForm.type}
                        onChange={handleCampaignInputChange}
                        className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      >
                        <option value="email">Email Marketing</option>
                        <option value="sms">SMS Campaign</option>
                        <option value="social">Social Media</option>
                        <option value="push">Push Notification</option>
                        <option value="banner">Banner Ads</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Target Audience</label>
                      <select
                        name="targetAudience"
                        value={campaignForm.targetAudience}
                        onChange={handleCampaignInputChange}
                        className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      >
                        <option value="all">All Customers</option>
                        <option value="vip">VIP Customers</option>
                        <option value="new">New Customers</option>
                        <option value="inactive">Inactive Customers</option>
                        <option value="wholesale">Wholesale Buyers</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Budget</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                          {currency?.symbol || "৳"}
                        </span>
                        <input
                          type="number"
                          name="budget"
                          value={campaignForm.budget}
                          onChange={handleCampaignInputChange}
                          className="w-full pl-10 p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                          placeholder="1000"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Status</label>
                      <select
                        name="status"
                        value={campaignForm.status}
                        onChange={handleCampaignInputChange}
                        className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={campaignForm.startDate}
                        onChange={handleCampaignInputChange}
                        className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">End Date (Optional)</label>
                      <input
                        type="date"
                        name="endDate"
                        value={campaignForm.endDate}
                        onChange={handleCampaignInputChange}
                        className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Description</label>
                    <textarea
                      name="description"
                      rows="3"
                      value={campaignForm.description}
                      onChange={handleCampaignInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                      placeholder="Describe your campaign..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Channels</label>
                    <div className="flex flex-wrap gap-3">
                      {['email', 'sms', 'social', 'push', 'banner'].map(channel => (
                        <label key={channel} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            value={channel}
                            checked={campaignForm.channels.includes(channel)}
                            onChange={handleCampaignInputChange}
                            className="rounded border-gray-700 bg-gray-800"
                          />
                          <span className="text-sm text-slate-300 capitalize">{channel}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Schedule Type</label>
                      <select
                        name="scheduleType"
                        value={campaignForm.scheduleType}
                        onChange={handleCampaignInputChange}
                        className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      >
                        <option value="immediate">Send Immediately</option>
                        <option value="scheduled">Schedule for Later</option>
                        <option value="recurring">Recurring</option>
                      </select>
                    </div>
                    
                    {campaignForm.scheduleType === 'recurring' && (
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Recurrence</label>
                        <select
                          name="recurrence"
                          value={campaignForm.recurrence}
                          onChange={handleCampaignInputChange}
                          className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        >
                          <option value="once">Once</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCampaignForm(false);
                      setSelectedCampaign(null);
                      setCampaignForm({
                        name: "", type: "email", targetAudience: "all", budget: "",
                        startDate: new Date().toISOString().split('T')[0], endDate: "",
                        status: "draft", description: "", template: "",
                        scheduleType: "immediate", recurrence: "once", channels: ["email"]
                      });
                    }}
                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : selectedCampaign ? (
                      <CheckCircle size={16} />
                    ) : (
                      <Send size={16} />
                    )}
                    {loading ? "Saving..." : selectedCampaign ? "Update Campaign" : "Create Campaign"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Content Form Modal */}
      {showContentForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {selectedContent ? "Edit Content" : "New Content"}
                </h2>
                <button
                  onClick={() => {
                    setShowContentForm(false);
                    setSelectedContent(null);
                    setContentForm({
                      title: "", type: "banner", content: "", position: "top",
                      backgroundColor: "#3b82f6", textColor: "#ffffff",
                      buttonText: "Learn More", buttonColor: "#10b981", buttonLink: "",
                      imageUrl: "", videoUrl: "", status: "draft",
                      scheduleDate: new Date().toISOString().split('T')[0],
                      devices: ["desktop", "mobile"], pages: ["home"],
                      priority: 1, impressions: 0, clicks: 0
                    });
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={selectedContent ? handleUpdateContent : handleCreateContent}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Form */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Title *</label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={contentForm.title}
                        onChange={handleContentInputChange}
                        className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="Summer Sale Banner"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Type</label>
                        <select
                          name="type"
                          value={contentForm.type}
                          onChange={handleContentInputChange}
                          className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        >
                          <option value="banner">Banner</option>
                          <option value="popup">Popup</option>
                          <option value="notification">Notification</option>
                          <option value="hero">Hero Section</option>
                          <option value="testimonial">Testimonial</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Position</label>
                        <select
                          name="position"
                          value={contentForm.position}
                          onChange={handleContentInputChange}
                          className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        >
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                          <option value="sidebar">Sidebar</option>
                          <option value="center">Center</option>
                          <option value="fullscreen">Fullscreen</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Content *</label>
                      <textarea
                        name="content"
                        rows="4"
                        required
                        value={contentForm.content}
                        onChange={handleContentInputChange}
                        className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                        placeholder="Enter your content here..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Button Text</label>
                        <input
                          type="text"
                          name="buttonText"
                          value={contentForm.buttonText}
                          onChange={handleContentInputChange}
                          className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                          placeholder="Learn More"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Button Link</label>
                        <input
                          type="url"
                          name="buttonLink"
                          value={contentForm.buttonLink}
                          onChange={handleContentInputChange}
                          className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                          placeholder="https://example.com/offer"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Devices</label>
                      <div className="flex gap-4">
                        {['desktop', 'mobile', 'tablet'].map(device => (
                          <label key={device} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              name="devices"
                              value={device}
                              checked={contentForm.devices.includes(device)}
                              onChange={handleContentInputChange}
                              className="rounded border-gray-700 bg-gray-800"
                            />
                            <span className="text-sm text-slate-300 capitalize">{device}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Preview & Colors */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Preview</label>
                      <div 
                        className="p-6 rounded-2xl border border-gray-700 min-h-[200px] flex flex-col justify-center items-center"
                        style={{ backgroundColor: contentForm.backgroundColor, color: contentForm.textColor }}
                      >
                        <p className="text-lg font-bold mb-3 text-center">{contentForm.title || "Your Title"}</p>
                        <p className="text-center mb-4">{contentForm.content || "Your content will appear here..."}</p>
                        {contentForm.buttonText && (
                          <button
                            type="button"
                            className="px-6 py-2 rounded-lg font-medium"
                            style={{ backgroundColor: contentForm.buttonColor, color: '#ffffff' }}
                          >
                            {contentForm.buttonText}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Background Color</label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            name="backgroundColor"
                            value={contentForm.backgroundColor}
                            onChange={handleContentInputChange}
                            className="w-10 h-10 cursor-pointer"
                          />
                          <input
                            type="text"
                            name="backgroundColor"
                            value={contentForm.backgroundColor}
                            onChange={handleContentInputChange}
                            className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Text Color</label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            name="textColor"
                            value={contentForm.textColor}
                            onChange={handleContentInputChange}
                            className="w-10 h-10 cursor-pointer"
                          />
                          <input
                            type="text"
                            name="textColor"
                            value={contentForm.textColor}
                            onChange={handleContentInputChange}
                            className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Button Color</label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          name="buttonColor"
                          value={contentForm.buttonColor}
                          onChange={handleContentInputChange}
                          className="w-10 h-10 cursor-pointer"
                        />
                        <input
                          type="text"
                          name="buttonColor"
                          value={contentForm.buttonColor}
                          onChange={handleContentInputChange}
                          className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Priority (1-10)</label>
                        <input
                          type="number"
                          name="priority"
                          min="1"
                          max="10"
                          value={contentForm.priority}
                          onChange={handleContentInputChange}
                          className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Status</label>
                        <select
                          name="status"
                          value={contentForm.status}
                          onChange={handleContentInputChange}
                          className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>
                    
                    {contentForm.status === 'scheduled' && (
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Schedule Date</label>
                        <input
                          type="date"
                          name="scheduleDate"
                          value={contentForm.scheduleDate}
                          onChange={handleContentInputChange}
                          className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowContentForm(false);
                      setSelectedContent(null);
                      setContentForm({
                        title: "", type: "banner", content: "", position: "top",
                        backgroundColor: "#3b82f6", textColor: "#ffffff",
                        buttonText: "Learn More", buttonColor: "#10b981", buttonLink: "",
                        imageUrl: "", videoUrl: "", status: "draft",
                        scheduleDate: new Date().toISOString().split('T')[0],
                        devices: ["desktop", "mobile"], pages: ["home"],
                        priority: 1, impressions: 0, clicks: 0
                      });
                    }}
                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : selectedContent ? (
                      <CheckCircle size={16} />
                    ) : (
                      <Image size={16} />
                    )}
                    {loading ? "Saving..." : selectedContent ? "Update Content" : "Create Content"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Content Preview Modal */}
      {showPreview && previewContent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-4xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Content Preview</h2>
                <div className="flex items-center gap-3">
                  <div className="flex bg-gray-800 rounded-lg">
                    {['mobile', 'tablet', 'desktop'].map(device => (
                      <button
                        key={device}
                        onClick={() => setDevicePreview(device)}
                        className={`px-4 py-2 rounded-lg capitalize ${
                          devicePreview === device
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {device === 'mobile' ? <Smartphone size={16} /> :
                         device === 'tablet' ? <Tablet size={16} /> :
                         <Monitor size={16} />}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className={`mx-auto border-4 border-gray-700 rounded-2xl bg-white overflow-hidden ${
                devicePreview === 'mobile' ? 'max-w-[320px]' :
                devicePreview === 'tablet' ? 'max-w-[768px]' :
                'max-w-[1024px]'
              }`}>
                <div className="p-4 bg-gray-800 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-white">
                    <Globe size={16} />
                    <span className="text-sm">yourwebsite.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                  </div>
                </div>
                
                <div 
                  className="min-h-[400px] p-8 flex flex-col justify-center items-center"
                  style={{ 
                    backgroundColor: previewContent.backgroundColor,
                    color: previewContent.textColor
                  }}
                >
                  <h1 className="text-3xl font-bold mb-4 text-center">
                    {previewContent.title}
                  </h1>
                  <p className="text-lg mb-6 text-center">
                    {previewContent.content}
                  </p>
                  {previewContent.buttonText && (
                    <button
                      className="px-8 py-3 rounded-lg font-bold text-white transition-transform hover:scale-105"
                      style={{ backgroundColor: previewContent.buttonColor }}
                    >
                      {previewContent.buttonText}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-slate-400">Type</p>
                  <p className="font-bold text-white capitalize">{previewContent.type}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-slate-400">Position</p>
                  <p className="font-bold text-white capitalize">{previewContent.position}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-slate-400">Impressions</p>
                  <p className="font-bold text-white">{previewContent.impressions || 0}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-slate-400">Clicks</p>
                  <p className="font-bold text-green-500">{previewContent.clicks || 0}</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedContent(previewContent);
                    setContentForm({
                      title: previewContent.title,
                      type: previewContent.type,
                      content: previewContent.content,
                      position: previewContent.position,
                      backgroundColor: previewContent.backgroundColor,
                      textColor: previewContent.textColor,
                      buttonText: previewContent.buttonText,
                      buttonColor: previewContent.buttonColor,
                      buttonLink: previewContent.buttonLink,
                      imageUrl: previewContent.imageUrl,
                      videoUrl: previewContent.videoUrl,
                      status: previewContent.status,
                      scheduleDate: previewContent.scheduleDate?.split('T')[0] || new Date().toISOString().split('T')[0],
                      devices: previewContent.devices || ["desktop", "mobile"],
                      pages: previewContent.pages || ["home"],
                      priority: previewContent.priority || 1,
                      impressions: previewContent.impressions || 0,
                      clicks: previewContent.clicks || 0
                    });
                    setShowPreview(false);
                    setShowContentForm(true);
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
                >
                  Edit Content
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}