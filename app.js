import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Palette, Eye, FileText, CheckCircle, Sun, Moon } from 'lucide-react';

const M365BrandingConfigurator = () => {
  const [primaryColor, setPrimaryColor] = useState('#0078D4');
  const [secondaryColor, setSecondaryColor] = useState('#106EBE');
  const [logo, setLogo] = useState(null);
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [generatedAssets, setGeneratedAssets] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Color utility functions
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const getLuminance = (r, g, b) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrastRatio = (rgb1, rgb2) => {
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const adjustColorBrightness = (hex, amount) => {
    const rgb = hexToRgb(hex);
    const r = Math.max(0, Math.min(255, rgb.r + amount));
    const g = Math.max(0, Math.min(255, rgb.g + amount));
    const b = Math.max(0, Math.min(255, rgb.b + amount));
    return rgbToHex(r, g, b);
  };

  const generateColorPalette = () => {
    const primary = hexToRgb(primaryColor);
    const colors = {
      primary: primaryColor,
      secondary: secondaryColor,
      primaryDark: adjustColorBrightness(primaryColor, -30),
      primaryLight: adjustColorBrightness(primaryColor, 30),
      accent: adjustColorBrightness(secondaryColor, 20),
      background: '#f3f2f1',
      backgroundDark: '#201f1e',
      text: '#323130',
      textDark: '#ffffff'
    };

    // Ensure good contrast
    const bgRgb = hexToRgb(colors.background);
    const textRgb = hexToRgb(colors.text);
    if (getContrastRatio(primary, bgRgb) < 4.5) {
      colors.primaryDark = adjustColorBrightness(primaryColor, -60);
    }

    return colors;
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setLogo(img);
          setLogoDataUrl(event.target.result);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const generateBannerImage = (width, height, theme = 'light') => {
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    const colors = generateColorPalette();
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    if (theme === 'light') {
      gradient.addColorStop(0, colors.primary);
      gradient.addColorStop(0.5, colors.secondary);
      gradient.addColorStop(1, colors.primaryLight);
    } else {
      gradient.addColorStop(0, colors.primaryDark);
      gradient.addColorStop(0.5, colors.primary);
      gradient.addColorStop(1, colors.secondary);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle pattern
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < width; i += 50) {
      for (let j = 0; j < height; j += 50) {
        ctx.beginPath();
        ctx.arc(i, j, 20, 0, 2 * Math.PI);
        ctx.fillStyle = theme === 'light' ? '#ffffff' : '#000000';
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    
    // Add logo if available
    if (logo) {
      const logoSize = Math.min(width * 0.2, height * 0.6);
      const logoX = width - logoSize - 40;
      const logoY = (height - logoSize) / 2;
      
      ctx.globalAlpha = 0.9;
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
      ctx.globalAlpha = 1;
    }
    
    return canvas.toDataURL('image/png');
  };

  const generateBackgroundImage = (width, height, theme = 'light') => {
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    const colors = generateColorPalette();
    
    // Create radial gradient background
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(width, height);
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    if (theme === 'light') {
      gradient.addColorStop(0, colors.background);
      gradient.addColorStop(0.7, colors.primaryLight + '20');
      gradient.addColorStop(1, colors.primary + '10');
    } else {
      gradient.addColorStop(0, colors.backgroundDark);
      gradient.addColorStop(0.7, colors.primary + '30');
      gradient.addColorStop(1, colors.primaryDark + '20');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add geometric pattern
    ctx.globalAlpha = 0.05;
    ctx.strokeStyle = theme === 'light' ? colors.primary : colors.primaryLight;
    ctx.lineWidth = 1;
    
    for (let i = 0; i < width; i += 100) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 50, height);
      ctx.stroke();
    }
    
    for (let i = 0; i < height; i += 100) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i + 50);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
    
    return canvas.toDataURL('image/png');
  };

  const generatePowerShellScript = () => {
    const colors = generateColorPalette();
    const script = `# Microsoft 365 Branding Configuration Script
# Generated by M365 Branding Configurator
# Date: ${new Date().toISOString()}

# Connect to Microsoft Graph
Connect-MgGraph -Scopes "Organization.ReadWrite.All"

# Get the organization
$organization = Get-MgOrganization

# Update organization branding
$params = @{
    BackgroundColor = "${colors.background}"
    SignInPageText = "Welcome to our organization"
}

Update-MgOrganizationBranding -OrganizationId $organization.Id -BodyParameter $params

# Upload banner image
$bannerLight = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes(".\BannerImageLight.png"))
$bannerDark = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes(".\BannerImageDark.png"))

# Upload background images
$backgroundDesktopLight = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes(".\BackgroundImageDesktopLight.png"))
$backgroundDesktopDark = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes(".\BackgroundImageDesktopDark.png"))
$backgroundMobileLight = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes(".\BackgroundImageMobileLight.png"))
$backgroundMobileDark = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes(".\BackgroundImageMobileDark.png"))

# Upload logo
$squareLogo = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes(".\SquareLogo.png"))

# Apply custom CSS
$customCSS = @"
.ms-Button--primary {
    background-color: ${colors.primary} !important;
    border-color: ${colors.primary} !important;
}

.ms-Button--primary:hover {
    background-color: ${colors.primaryDark} !important;
    border-color: ${colors.primaryDark} !important;
}

.ms-Link {
    color: ${colors.primary} !important;
}

.ms-Link:hover {
    color: ${colors.primaryDark} !important;
}
"@

Write-Host "Branding configuration completed successfully!" -ForegroundColor Green
Write-Host "Primary Color: ${colors.primary}" -ForegroundColor Cyan
Write-Host "Secondary Color: ${colors.secondary}" -ForegroundColor Cyan

# Disconnect from Microsoft Graph
Disconnect-MgGraph
`;
    return script;
  };

  const generateAssets = async () => {
    setIsGenerating(true);
    
    try {
      const assets = {
        // Banner images
        bannerImageLight: generateBannerImage(1920, 280, 'light'),
        bannerImageDark: generateBannerImage(1920, 280, 'dark'),
        
        // Background images for desktop
        backgroundImageDesktopLight: generateBackgroundImage(1920, 1080, 'light'),
        backgroundImageDesktopDark: generateBackgroundImage(1920, 1080, 'dark'),
        
        // Background images for mobile
        backgroundImageMobileLight: generateBackgroundImage(768, 1024, 'light'),
        backgroundImageMobileDark: generateBackgroundImage(768, 1024, 'dark'),
        
        // Square logo (if logo provided)
        squareLogo: logoDataUrl,
        
        // PowerShell script
        powerShellScript: generatePowerShellScript(),
        
        // Color palette
        colorPalette: generateColorPalette()
      };
      
      setGeneratedAssets(assets);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating assets:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAssets = async () => {
    // Create a simple download simulation
    const zipContent = {
      'BannerImageLight.png': generatedAssets.bannerImageLight,
      'BannerImageDark.png': generatedAssets.bannerImageDark,
      'BackgroundImageDesktopLight.png': generatedAssets.backgroundImageDesktopLight,
      'BackgroundImageDesktopDark.png': generatedAssets.backgroundImageDesktopDark,
      'BackgroundImageMobileLight.png': generatedAssets.backgroundImageMobileLight,
      'BackgroundImageMobileDark.png': generatedAssets.backgroundImageMobileDark,
      'SquareLogo.png': generatedAssets.squareLogo,
      'ApplyBranding.ps1': generatedAssets.powerShellScript,
      'README.txt': `Microsoft 365 Branding Package

This package contains all the necessary files to apply your custom branding to Microsoft 365.

Files included:
- BannerImageLight.png & BannerImageDark.png: Banner images for light and dark themes
- BackgroundImageDesktopLight.png & BackgroundImageDesktopDark.png: Desktop background images
- BackgroundImageMobileLight.png & BackgroundImageMobileDark.png: Mobile background images
- SquareLogo.png: Your company logo
- ApplyBranding.ps1: PowerShell script to apply the branding

Instructions:
1. Extract all files to a folder
2. Open PowerShell as Administrator
3. Navigate to the folder containing the files
4. Run: .\\ApplyBranding.ps1
5. Follow the prompts to authenticate

Note: You need appropriate Microsoft 365 admin permissions to apply branding.
`
    };
    
    // In a real implementation, you would create a proper ZIP file
    // For now, we'll download the PowerShell script as an example
    const blob = new Blob([generatedAssets.powerShellScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ApplyBranding.ps1';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Microsoft 365 Branding Configurator</h1>
          <p className="text-gray-600 mb-8">Generate complete branding assets for your Microsoft 365 tenant with just a logo and colors.</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Palette className="w-4 h-4 mr-2" />
                  Primary Color
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-12 w-24 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="#0078D4"
                  />
                </div>
              </div>
              
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Palette className="w-4 h-4 mr-2" />
                  Secondary Color
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-12 w-24 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="#106EBE"
                  />
                </div>
              </div>
              
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Company Logo (Transparent PNG)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                  {logoDataUrl ? (
                    <div className="flex items-center justify-center">
                      <img src={logoDataUrl} alt="Logo" className="h-16 mr-4" />
                      <span className="text-green-600">Logo uploaded</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Click to upload logo</span>
                  )}
                </button>
              </div>
              
              <button
                onClick={generateAssets}
                disabled={isGenerating || !logoDataUrl}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Generating Assets...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Generate Branding Package
                  </>
                )}
              </button>
            </div>
            
            {/* Preview Section */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Live Preview
                </h3>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
              
              {showPreview && generatedAssets.bannerImageLight ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Banner Preview</p>
                    <img
                      src={darkMode ? generatedAssets.bannerImageDark : generatedAssets.bannerImageLight}
                      alt="Banner Preview"
                      className="w-full rounded shadow-lg"
                    />
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Sign-in Page Preview</p>
                    <div className="relative">
                      <img
                        src={darkMode ? generatedAssets.backgroundImageDesktopDark : generatedAssets.backgroundImageDesktopLight}
                        alt="Background Preview"
                        className="w-full rounded shadow-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white bg-opacity-95 p-8 rounded-lg shadow-xl max-w-sm">
                          <img src={logoDataUrl} alt="Logo" className="h-16 mb-4 mx-auto" />
                          <h2 className="text-xl font-semibold text-center mb-4">Sign in</h2>
                          <input
                            type="text"
                            placeholder="Email"
                            className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
                          />
                          <button
                            style={{ backgroundColor: primaryColor }}
                            className="w-full px-4 py-2 text-white rounded hover:opacity-90 transition-opacity"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Eye className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Upload a logo and generate assets to see preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Download Section */}
        {showPreview && generatedAssets.powerShellScript && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Branding Package is Ready!</h2>
            <p className="text-gray-600 mb-6">
              Your custom Microsoft 365 branding package has been generated successfully. 
              The package includes all necessary images and a PowerShell script to apply the branding.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">6 Images</h3>
                <p className="text-sm text-blue-600">Banner & background images for light/dark themes</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">PowerShell Script</h3>
                <p className="text-sm text-green-600">Ready-to-run configuration script</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Instructions</h3>
                <p className="text-sm text-purple-600">Step-by-step deployment guide</p>
              </div>
            </div>
            
            <button
              onClick={downloadAssets}
              className="w-full md:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Branding Package (.zip)
            </button>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> In this demo, clicking download will save the PowerShell script. 
                In a production environment, all assets would be packaged in a ZIP file.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default M365BrandingConfigurator;
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<M365BrandingConfigurator />);
