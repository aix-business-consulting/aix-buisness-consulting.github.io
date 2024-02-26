import { BACKEND_IP } from "@/lib/api";
import React, { useState, DragEvent } from "react";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

const FileDrop: React.FC = () => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State to hold the selected file

  const { mutate, isLoading } = useMutation(
    (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return fetch(`${BACKEND_IP}/upload-excel`, {
        method: "POST",
        body: formData,
      }).then((res) => res.json());
    },
    {
      onMutate: () => {
        toast.loading("Uploading file...", {
          id: "uploading",
        });
      },
      onError: () => {
        toast.error("Error uploading file", {
          id: "uploading",
        });
      },
      onSuccess: () => {
        toast.success("File uploaded successfully!", {
          id: "uploading",
        });
      }
    }
  );

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length) {
      setSelectedFile(files[0]); // Set the selected file
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      mutate(selectedFile); // Upload the file when the button is clicked
    }
  };

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed p-4 mt-20 w-[800px] h-[400px] mx-auto text-center ${
          dragOver ? "border-black" : "border-gray-300"
        }
        ${selectedFile ? "border-green-800" : "bg-white"}
        `}
      >
        <p className="text-lg">
          {selectedFile
            ? "File selected:" + selectedFile.name
            : "Drag and drop an Excel file here."}
        </p>
      </div>
      <button
        onClick={handleUploadClick}
        className="w-40 mx-auto mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={!selectedFile || isLoading} // Disable the button if no file is selected or if a file is currently being uploaded
      >
        {isLoading ? "Uploading..." : "Upload"}
      </button>
    </>
  );
};

export default FileDrop;
