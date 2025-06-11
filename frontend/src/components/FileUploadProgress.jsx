import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Upload } from "lucide-react";

const FileUploadProgress = ({ isUploading, progress, error, success }) => {
  if (!isUploading && !error && !success) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-base-100 border border-base-300 rounded-lg shadow-lg p-4 min-w-[300px] z-50">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          {error ? (
            <AlertCircle className="w-6 h-6 text-error" />
          ) : success ? (
            <CheckCircle className="w-6 h-6 text-success" />
          ) : (
            <Upload className="w-6 h-6 text-primary animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-sm font-medium text-base-content">
            {error ? 'Upload Failed' : success ? 'Upload Complete' : 'Uploading File...'}
          </p>
          
          {error && (
            <p className="text-xs text-error mt-1">{error}</p>
          )}
          
          {isUploading && (
            <div className="w-full bg-base-300 rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadProgress;