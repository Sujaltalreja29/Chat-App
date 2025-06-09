import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send, Palette, Eye, Monitor, Smartphone } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going? 👋", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features for our chat app. 🚀", isSent: true },
  { id: 3, content: "That sounds awesome! Can't wait to see what you've built.", isSent: false },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  const getThemeDisplayName = (themeName) => {
    return themeName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="min-h-screen bg-base-200 pt-16">
      <div className="max-w-6xl mx-auto p-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2 flex items-center justify-center gap-3">
            <Palette className="w-8 h-8 text-primary" />
            Settings
          </h1>
          <p className="text-base-content/70">
            Customize your chat experience
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Theme Selection */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">
                
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="card-title text-base-content">Choose Theme</h2>
                    <p className="text-sm text-base-content/70">
                      Select a theme that matches your style
                    </p>
                  </div>
                </div>

                {/* Theme Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {THEMES.map((t) => (
                    <button
                      key={t}
                      className={`card border-2 transition-all duration-200 hover:scale-105 ${
                        theme === t 
                          ? "border-primary bg-primary/10 shadow-lg" 
                          : "border-base-300 bg-base-100 hover:border-primary/50 hover:shadow-md"
                      }`}
                      onClick={() => handleThemeChange(t)}
                    >
                      <div className="card-body p-4 items-center text-center">
                        {/* Theme Preview */}
                        <div className="relative w-full h-12 rounded-lg overflow-hidden shadow-sm" data-theme={t}>
                          <div className="absolute inset-0 grid grid-cols-4 gap-1 p-1.5">
                            <div className="rounded bg-primary opacity-90"></div>
                            <div className="rounded bg-secondary opacity-90"></div>
                            <div className="rounded bg-accent opacity-90"></div>
                            <div className="rounded bg-neutral opacity-90"></div>
                          </div>
                          
                          {/* Selection Indicator */}
                          {theme === t && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                              <div className="w-6 h-6 bg-base-100 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Theme Name */}
                        <span className={`text-xs font-medium text-center transition-colors ${
                          theme === t ? "text-primary" : "text-base-content"
                        }`}>
                          {getThemeDisplayName(t)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Current Theme Info */}
                <div className="mt-6 alert">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="font-medium text-base-content">Current Theme</p>
                      <p className="text-sm text-base-content/70">{getThemeDisplayName(theme)}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm" data-theme={theme}>
                      <div className="grid grid-cols-2 gap-0.5 h-full p-1">
                        <div className="rounded bg-primary"></div>
                        <div className="rounded bg-secondary"></div>
                        <div className="rounded bg-accent"></div>
                        <div className="rounded bg-neutral"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            
            {/* Preview Section */}
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-5 h-5 text-primary" />
                  <h3 className="card-title text-base-content">Live Preview</h3>
                </div>

                {/* Mini Chat Preview */}
                <div className="mockup-window border border-base-300 bg-base-200" data-theme={theme}>
                  <div className="bg-base-100 px-4 py-16">
                    <div className="space-y-2">
                      <div className="chat chat-start">
                        <div className="chat-bubble chat-bubble-primary">Hey there! 👋</div>
                      </div>
                      <div className="chat chat-end">
                        <div className="chat-bubble">How's it going?</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">
                <h3 className="card-title text-base-content mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-primary" />
                  Display Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/70">Auto Dark Mode</span>
                    <input type="checkbox" className="toggle toggle-primary toggle-sm" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/70">Compact Mode</span>
                    <input type="checkbox" className="toggle toggle-primary toggle-sm" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/70">Show Timestamps</span>
                    <input type="checkbox" className="toggle toggle-primary toggle-sm" defaultChecked />
                  </div>
                </div>
              </div>
            </div>

            {/* App Info */}
            <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <h3 className="card-title text-base-content">App Info</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Version</span>
                    <span className="font-medium text-base-content">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Last Updated</span>
                    <span className="font-medium text-base-content">Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;