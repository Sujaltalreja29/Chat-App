// pages/SettingsPage.jsx - Clean & Responsive
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Palette, Eye, Monitor } from "lucide-react";

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
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        
        {/* Compact Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
            <Palette className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            Settings
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Theme Selection */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4 md:p-6">
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Palette className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Choose Theme</h2>
                    <p className="text-sm text-base-content/70">
                      Select your preferred theme
                    </p>
                  </div>
                </div>

                {/* Theme Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t}
                      className={`card border-2 transition-all duration-200 hover:scale-105 ${
                        theme === t 
                          ? "border-primary bg-primary/10" 
                          : "border-base-300 hover:border-primary/50"
                      }`}
                      onClick={() => handleThemeChange(t)}
                    >
                      <div className="card-body p-3 items-center text-center">
                        {/* Theme Preview */}
                        <div className="relative w-full h-10 rounded-lg overflow-hidden" data-theme={t}>
                          <div className="absolute inset-0 grid grid-cols-4 gap-1 p-1">
                            <div className="rounded bg-primary"></div>
                            <div className="rounded bg-secondary"></div>
                            <div className="rounded bg-accent"></div>
                            <div className="rounded bg-neutral"></div>
                          </div>
                          
                          {/* Selection Indicator */}
                          {theme === t && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <div className="w-4 h-4 bg-base-100 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Theme Name */}
                        <span className={`text-xs font-medium mt-2 ${
                          theme === t ? "text-primary" : "text-base-content"
                        }`}>
                          {getThemeDisplayName(t)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Current Theme Info */}
                <div className="mt-6 alert alert-info">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="font-medium">Current: {getThemeDisplayName(theme)}</p>
                    </div>
                    <div className="w-6 h-6 rounded overflow-hidden" data-theme={theme}>
                      <div className="grid grid-cols-2 gap-0.5 h-full p-0.5">
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
          <div className="space-y-4">
            
            {/* Preview Section */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Live Preview</h3>
                </div>

                {/* Mini Chat Preview */}
                <div className="mockup-window border border-base-300 bg-base-200" data-theme={theme}>
                  <div className="bg-base-100 px-4 py-8">
                    <div className="space-y-2">
                      <div className="chat chat-start">
                        <div className="chat-bubble chat-bubble-primary text-xs">Hey! 👋</div>
                      </div>
                      <div className="chat chat-end">
                        <div className="chat-bubble text-xs">How's it going?</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary" />
                  Display
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto Dark Mode</span>
                    <input type="checkbox" className="toggle toggle-primary toggle-sm" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compact Mode</span>
                    <input type="checkbox" className="toggle toggle-primary toggle-sm" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show Timestamps</span>
                    <input type="checkbox" className="toggle toggle-primary toggle-sm" defaultChecked />
                  </div>
                </div>
              </div>
            </div>

            {/* App Info */}
            <div className="card bg-primary/10 border border-primary/20 shadow-sm">
              <div className="card-body p-4">
                <h3 className="font-semibold mb-3">App Info</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Version</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Updated</span>
                    <span className="font-medium">Today</span>
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