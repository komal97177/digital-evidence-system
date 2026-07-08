// Location: /frontend/src/components/evidence/EvidenceQRCode.jsx
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, Printer, Share2, X } from 'lucide-react';
import { toast } from 'react-toastify';

const EvidenceQRCode = ({ evidenceId, evidenceData, onClose }) => {
    const [copied, setCopied] = useState(false);
    const [qrValue, setQrValue] = useState('');
    const [size, setSize] = useState(200);

    useEffect(() => {
        // Generate QR code data with evidence information
        const qrData = {
            id: evidenceId,
            evidenceId: evidenceData?.evidence_id || evidenceId,
            caseNumber: evidenceData?.case_number || 'N/A',
            title: evidenceData?.title || 'Evidence',
            description: evidenceData?.description || '',
            timestamp: new Date().toISOString(),
            hash: evidenceData?.sha256_hash || '',
            status: evidenceData?.status || 'registered',
            url: `${window.location.origin}/evidence/${evidenceId}`,
            verificationUrl: `${window.location.origin}/custody/verify/${evidenceId}`
        };
        setQrValue(JSON.stringify(qrData));
    }, [evidenceId, evidenceData]);

    const downloadQR = () => {
        const canvas = document.getElementById('evidence-qr');
        if (!canvas) return;
        
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `evidence-${evidenceData?.evidence_id || evidenceId}-qr.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success('QR Code downloaded');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(qrValue);
        setCopied(true);
        toast.success('QR data copied to clipboard');
        setTimeout(() => setCopied(false), 3000);
    };

    const printQR = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        
        const canvas = document.getElementById('evidence-qr');
        const qrImage = canvas.toDataURL('image/png');
        
        printWindow.document.write(`
            <html>
                <head><title>QR Code - ${evidenceData?.evidence_id || evidenceId}</title></head>
                <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Arial,sans-serif;">
                    <h1>Evidence QR Code</h1>
                    <p>${evidenceData?.evidence_id || evidenceId} - ${evidenceData?.title || 'Evidence'}</p>
                    <img src="${qrImage}" style="width:300px;height:300px;margin:20px;" />
                    <p style="font-size:12px;color:#666;">Generated: ${new Date().toLocaleString()}</p>
                    <p style="font-size:12px;color:#666;">Scan to verify authenticity</p>
                    <script>
                        window.onload = function() { window.print(); }
                    <\/script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const shareQR = async () => {
        try {
            const canvas = document.getElementById('evidence-qr');
            if (!canvas) return;
            
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], `qr-${evidenceData?.evidence_id || evidenceId}.png`, { type: 'image/png' });
            
            if (navigator.share) {
                await navigator.share({
                    title: `Evidence QR Code - ${evidenceData?.evidence_id || evidenceId}`,
                    text: `Evidence QR Code for ${evidenceData?.title || 'Evidence'}`,
                    files: [file]
                });
                toast.success('Shared successfully');
            } else {
                // Fallback: copy URL
                await navigator.clipboard.writeText(qrValue);
                toast.success('QR data copied to clipboard');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                toast.error('Failed to share');
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* QR Code Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Evidence QR Code</h3>
                    <p className="text-sm text-gray-500">
                        {evidenceData?.evidence_id || evidenceId}
                    </p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-lg">
                    <QRCodeSVG
                        id="evidence-qr"
                        value={qrValue}
                        size={size}
                        level="H"
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#0a1a3a"
                    />
                </div>

                {/* Evidence Info */}
                <div className="mt-4 text-center space-y-1">
                    <p className="font-medium text-gray-900">
                        {evidenceData?.title || 'Evidence'}
                    </p>
                    <p className="text-sm text-gray-500">
                        ID: {evidenceData?.evidence_id || evidenceId}
                    </p>
                    {evidenceData?.case_number && (
                        <p className="text-sm text-gray-500">
                            Case: {evidenceData.case_number}
                        </p>
                    )}
                    {evidenceData?.sha256_hash && (
                        <p className="text-xs text-gray-400 font-mono mt-2 break-all">
                            Hash: {evidenceData.sha256_hash}
                        </p>
                    )}
                </div>

                {/* Size Controls */}
                <div className="mt-4 flex items-center space-x-3">
                    <label className="text-sm text-gray-600">Size:</label>
                    <input
                        type="range"
                        min="150"
                        max="400"
                        value={size}
                        onChange={(e) => setSize(parseInt(e.target.value))}
                        className="w-32"
                    />
                    <span className="text-sm text-gray-500">{size}px</span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                    <button
                        onClick={downloadQR}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </button>
                    <button
                        onClick={printQR}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </button>
                    <button
                        onClick={shareQR}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </button>
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 mr-2 text-green-500" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Data
                            </>
                        )}
                    </button>
                </div>

                {/* Verification Link */}
                <div className="mt-4 text-center">
                    <a
                        href={`/custody/verify/${evidenceId}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Verify Evidence Integrity →
                    </a>
                </div>

                {/* Footer */}
                <p className="text-xs text-gray-400 mt-4">
                    Scan this QR code to verify evidence authenticity
                </p>
                <p className="text-xs text-gray-400">
                    Generated: {new Date().toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default EvidenceQRCode;