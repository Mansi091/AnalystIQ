import { useState } from "react";
import { uploadDataset } from "../api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function FileUploader({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a dataset first");
      return;
    }

    try {
      setLoading(true);

      const response = await uploadDataset(file);

      onUploadSuccess(response.filename);

      alert("Dataset uploaded successfully");
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Dataset</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {file && (
          <p className="text-sm text-muted-foreground">
            Selected: {file.name}
          </p>
        )}

        <Button
          onClick={handleUpload}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Uploading..." : "Upload Dataset"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default FileUploader;