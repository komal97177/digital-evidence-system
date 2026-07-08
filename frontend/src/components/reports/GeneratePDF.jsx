// Location: /frontend/src/components/reports/GeneratePDF.jsx
import React, { useState } from 'react';
import { 
    X,
    FileText,
    Download,
    Printer,
    Settings,
    CheckCircle,
    AlertCircle,
    Loader2,
    Eye,
    ChevronDown,
    ChevronUp,
    Sun,
    Moon,
    Layout,
    Type,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Table,
    Image,
    Link as LinkIcon,
    Save,
    Share2,
    Mail
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const GeneratePDF = ({ report, type, onClose, onGenerate }) => {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(false);
    const [settings, setSettings] = useState({
        orientation: 'portrait',
        size: 'a4',
        font: 'inter',
        fontSize: '12',
        lineHeight: '1.5',
        margin: 'normal',
        header: true,
        footer: true,
        pageNumbers: true,
        watermark: false,
        color: 'color'
    });
    const [expandedSettings, setExpandedSettings] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await api.post('/reports/generate-pdf', {
                report,
                type,
                settings
            }, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `${type}-report-${report?.case?.case_number || report?.evidence?.evidence_id || 'report'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success('PDF generated successfully');
            onGenerate?.(response.data);
            onClose();
        } catch (error) {
            toast.error('Failed to generate PDF');
            console.error('PDF Generation Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = () => {
        setPreview(true);
        // Open preview in new window
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
            previewWindow.document.write(`
                <html>
                    <head>
                        <title>PDF Preview - ${type} Report</title>
                        <style>
                            body { font-family: Inter, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                            .header { text-align: center; border-bottom: 2px solid #0a1a3a; padding-bottom: 20px; margin-bottom: 20px; }
                            .content { line-height: 1.6; }
                            .footer { text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px; font-size: 12px; color: #6b7280; }
                            .section { margin-bottom: 20px; }
                            .section-title { font-size: 18px; font-weight: 600; color: #0a1a3a; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; }
                            .label { font-weight: 500; color: #4b5563; }
                            .value { margin-left: 4px; }
                            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                            .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 12px; }
                            .badge-green { background: #dcfce7; color: #166534; }
                            .badge-yellow { background: #fef9c3; color: #854d0e; }
                            .badge-red { background: #fee2e2; color: #991b1b; }
                            .badge-gray { background: #f3f4f6; color: #4b5563; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>${type === 'forensic' ? 'Forensic Report' : 'Investigation Report'}</h1>
                            <p>${report?.case?.case_number || report?.evidence?.evidence_id || 'N/A'}</p>
                            <p style="color: #6b7280; font-size: 14px;">Generated: ${new Date().toLocaleString()}</p>
                        </div>
                        <div class="content">
                            <div class="section">
                                <h2 class="section-title">Overview</h2>
                                <p>${report?.case?.description || report?.evidence?.description || 'No description available.'}</p>
                            </div>
                            <div class="section">
                                <h2 class="section-title">Details</h2>
                                <div class="grid">
                                    <div><span class="label">ID:</span> <span class="value">${report?.case?.case_number || report?.evidence?.evidence_id || 'N/A'}</span></div>
                                    <div><span class="label">Status:</span> <span class="value">${report?.case?.status || report?.evidence?.status || 'N/A'}</span></div>
                                    <div><span class="label">Created:</span> <span class="value">${new Date(report?.case?.created_at || report?.evidence?.created_at).toLocaleDateString()}</span></div>
                                    <div><span class="label">Last Updated:</span> <span class="value">${new Date(report?.case?.updated_at || report?.evidence?.updated_at).toLocaleDateString()}</span></div>
                                </div>
                            </div>
                        </div>
                        <div class="footer">
                            <p>This is a system-generated report from the Digital Evidence Management System</p>
                            <p>© ${new Date().getFullYear()} Ministry of Home Affairs</p>
                        </div>
                    </body>
                </html>
            `);
            previewWindow.document.close();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <FileText className="w-6 h-6 text-blue-600" />
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Generate PDF</h3>
                                <p className="text-sm text-gray-500">
                                    {type === 'forensic' ? 'Forensic Report' : 'Investigation Report'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Preview Button */}
                    <button
                        onClick={handlePreview}
                        className="w-full flex items-center justify-center px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Report
                    </button>

                    {/* Settings Toggle */}
                    <button
                        onClick={() => setExpandedSettings(!expandedSettings)}
                        className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <span className="flex items-center">
                            <Settings className="w-4 h-4 mr-2" />
                            <span className="font-medium">PDF Settings</span>
                        </span>
                        {expandedSettings ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>

                    {expandedSettings && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Orientation
                                </label>
                                <select
                                    value={settings.orientation}
                                    onChange={(e) => setSettings({...settings, orientation: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="portrait">Portrait</option>
                                    <option value="landscape">Landscape</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Paper Size
                                </label>
                                <select
                                    value={settings.size}
                                    onChange={(e) => setSettings({...settings, size: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="a4">A4</option>
                                    <option value="letter">Letter</option>
                                    <option value="legal">Legal</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Font Size
                                </label>
                                <select
                                    value={settings.fontSize}
                                    onChange={(e) => setSettings({...settings, fontSize: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="10">10px</option>
                                    <option value="11">11px</option>
                                    <option value="12">12px</option>
                                    <option value="14">14px</option>
                                    <option value="16">16px</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Margins
                                </label>
                                <select
                                    value={settings.margin}
                                    onChange={(e) => setSettings({...settings, margin: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="narrow">Narrow</option>
                                    <option value="wide">Wide</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Include Sections
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <label className="flex items-center space-x-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={settings.header}
                                            onChange={(e) => setSettings({...settings, header: e.target.checked})}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Header</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={settings.footer}
                                            onChange={(e) => setSettings({...settings, footer: e.target.checked})}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Footer</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={settings.pageNumbers}
                                            onChange={(e) => setSettings({...settings, pageNumbers: e.target.checked})}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Page Numbers</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={settings.watermark}
                                            onChange={(e) => setSettings({...settings, watermark: e.target.checked})}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Watermark</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5 mr-2" />
                                    Generate & Download
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 flex items-start">
                        <Info className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                        <p>PDF will include all report data and maintain formatting for official use.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneratePDF;