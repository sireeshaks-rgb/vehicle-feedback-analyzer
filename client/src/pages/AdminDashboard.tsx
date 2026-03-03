import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { UploadCloud, FileSpreadsheet, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useUploadFeedback } from "@/hooks/use-feedback";
import { useToast } from "@/hooks/use-toast";

export function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const uploadMutation = useUploadFeedback();

  // Protect route
  if (isAuthenticated === false) {
    setLocation("/admin/auth");
    return null;
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive"
      });
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadMutation.mutate(selectedFile, {
      onSuccess: (data) => {
        toast({
          title: "Upload Successful",
          description: `Processed ${data.count} feedback records.`,
        });
        setSelectedFile(null);
        if (inputRef.current) inputRef.current.value = "";
      },
      onError: (err) => {
        toast({
          title: "Upload Failed",
          description: err.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/20">
      <Navbar />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-display font-bold mb-2">Data Management</h1>
          <p className="text-muted-foreground text-lg">Upload raw passenger feedback CSVs to train the analyzer.</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-border p-8"
        >
          <div 
            className={`border-3 border-dashed rounded-2xl p-12 transition-all flex flex-col items-center justify-center text-center
              ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/50'}
              ${selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              ref={inputRef}
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleChange}
            />
            
            {selectedFile ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-foreground">{selectedFile.name}</h3>
                <p className="text-muted-foreground mb-6">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setSelectedFile(null); if(inputRef.current) inputRef.current.value = ""; }}
                    className="px-6 py-3 rounded-xl font-medium border border-border hover:bg-secondary transition-colors"
                    disabled={uploadMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    className="px-8 py-3 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                    {uploadMutation.isPending ? "Uploading..." : "Confirm Upload"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-secondary text-muted-foreground rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <UploadCloud className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Drag & Drop your CSV here</h3>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Upload historical feedback data. Ensure it contains columns for review text, rating, and date.
                </p>
                <button 
                  onClick={() => inputRef.current?.click()}
                  className="px-8 py-4 rounded-xl font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border shadow-sm hover:shadow-md transition-all"
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/50">
              <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
              <div>
                <h4 className="font-bold text-foreground mb-1">CSV Format</h4>
                <p className="text-sm text-muted-foreground">Standard comma-separated values with headers.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/50">
              <AlertCircle className="w-6 h-6 text-primary shrink-0" />
              <div>
                <h4 className="font-bold text-foreground mb-1">Required Columns</h4>
                <p className="text-sm text-muted-foreground">review_text, rating (1-5).</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/50">
              <FileSpreadsheet className="w-6 h-6 text-primary shrink-0" />
              <div>
                <h4 className="font-bold text-foreground mb-1">Max Size</h4>
                <p className="text-sm text-muted-foreground">Up to 50MB per upload batch.</p>
              </div>
            </div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
