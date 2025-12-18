import { useState, useRef, useCallback, useEffect } from 'react';
import './ImageUpload.css';

// Use environment variable for API base URL
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';

export function ImageUpload({ onImageUploaded, currentImageUrl }) {
	const [preview, setPreview] = useState(currentImageUrl || null);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState(null);
	const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
	const [urlInput, setUrlInput] = useState('');
	const [isDragOver, setIsDragOver] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const fileInputRef = useRef(null);

	// Update preview when currentImageUrl prop changes
	useEffect(() => {
		setPreview(currentImageUrl || null);
		setError(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		setUrlInput('');
	}, [currentImageUrl]);

	const validateFile = (file) => {
		const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
		if (!validTypes.includes(file.type)) {
			setError('Invalid file type. Use PNG, JPG, GIF, or WebP.');
			return false;
		}

		if (file.size > 5 * 1024 * 1024) {
			setError('File too large. Maximum 5MB.');
			return false;
		}

		return true;
	};

	const compressImage = (file, maxWidth = 800, quality = 0.8) => {
		return new Promise((resolve) => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const img = new Image();
			
			img.onload = () => {
				// Calculate new dimensions
				let { width, height } = img;
				if (width > maxWidth) {
					height = (height * maxWidth) / width;
					width = maxWidth;
				}
				
				canvas.width = width;
				canvas.height = height;
				
				// Draw and compress
				ctx.drawImage(img, 0, 0, width, height);
				canvas.toBlob(resolve, 'image/jpeg', quality);
			};
			
			img.src = URL.createObjectURL(file);
		});
	};

	const uploadFile = async (file) => {
		if (!validateFile(file)) return;

		setIsUploading(true);
		setError(null);

		try {
			// Show preview immediately
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result);
			};
			reader.readAsDataURL(file);

			// Compress image if it's large
			let fileToUpload = file;
			if (file.size > 1024 * 1024) { // If larger than 1MB, compress
				fileToUpload = await compressImage(file);
			}

			const formData = new FormData();
			formData.append('file', fileToUpload);

			const token = localStorage.getItem('token');
			if (!token) {
				throw new Error('Please login to upload images');
			}

			const response = await fetch(`${API_BASE}/api/upload/image`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
				body: formData,
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.detail || 'Upload failed');
			}

			const data = await response.json();
			const imageUrl = `${API_BASE}${data.url}`;
			setPreview(imageUrl);
			onImageUploaded(imageUrl);
		} catch (err) {
			console.error('Upload error:', err);
			setError(err.message || 'Upload failed');
			setPreview(null);
		} finally {
			setIsUploading(false);
		}
	};

	const handleFileSelect = async (e) => {
		const file = e.target.files[0];
		if (!file) return;
		await uploadFile(file);
	};

	// Drag and drop handlers
	const handleDragOver = useCallback((e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(true);
	}, []);

	const handleDragLeave = useCallback((e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);
	}, []);

	const handleDrop = useCallback(async (e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);

		const files = Array.from(e.dataTransfer.files);
		const imageFile = files.find(file => file.type.startsWith('image/'));
		
		if (imageFile) {
			await uploadFile(imageFile);
		} else {
			setError('Please drop an image file');
		}
	}, []);

	// Paste functionality
	const handlePaste = useCallback(async (e) => {
		const items = Array.from(e.clipboardData.items);
		const imageItem = items.find(item => item.type.startsWith('image/'));
		
		if (imageItem) {
			e.preventDefault();
			const file = imageItem.getAsFile();
			if (file) {
				await uploadFile(file);
			}
		}
	}, []);

	const handleUrlSubmit = () => {
		if (!urlInput.trim()) {
			setError('Please enter a URL');
			return;
		}
		setPreview(urlInput);
		onImageUploaded(urlInput);
		setError(null);
	};

	const handleRemoveImage = () => {
		setPreview(null);
		onImageUploaded(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		setUrlInput('');
		setError(null);
	};

	const resetComponent = () => {
		setPreview(null);
		setError(null);
		setIsUploading(false);
		setUploadProgress(0);
		setIsDragOver(false);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		setUrlInput('');
	};

	return (
		<div className="image-upload" onPaste={handlePaste}>
			<div className="upload-tabs">
				<button
					type="button"
					className={`tab ${uploadMode === 'file' ? 'active' : ''}`}
					onClick={() => setUploadMode('file')}
				>
					📁 Upload File
				</button>
				<button
					type="button"
					className={`tab ${uploadMode === 'url' ? 'active' : ''}`}
					onClick={() => setUploadMode('url')}
				>
					🔗 URL
				</button>
			</div>

			{error && <div className="upload-error">{error}</div>}
			
			{isUploading && uploadProgress > 0 && (
				<div className="upload-progress">
					<div className="progress-bar">
						<div 
							className="progress-fill" 
							style={{ width: `${uploadProgress}%` }}
						></div>
					</div>
					<span className="progress-text">{uploadProgress}%</span>
				</div>
			)}

			{uploadMode === 'file' ? (
				<div 
					className={`file-upload-area ${isDragOver ? 'drag-over' : ''}`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileSelect}
						accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
						className="file-input"
						id="image-file-input"
						disabled={isUploading}
					/>
					<label htmlFor="image-file-input" className={`file-label ${isUploading ? 'uploading' : ''}`}>
						{isUploading ? (
							<>
								<span className="upload-icon uploading">⟳</span>
								<span>Uploading image...</span>
								<span className="hint">Please wait...</span>
							</>
						) : isDragOver ? (
							<>
								<span className="upload-icon">📥</span>
								<span>Drop your image here</span>
								<span className="hint">Release to upload</span>
							</>
						) : (
							<>
								<span className="upload-icon">📷</span>
								<span>Click to upload, drag & drop, or paste</span>
								<span className="hint">PNG, JPG, GIF, WebP (max 5MB) • Auto-compressed</span>
							</>
						)}
					</label>
				</div>
			) : (
				<div className="url-input-area">
					<input
						type="url"
						value={urlInput}
						onChange={(e) => setUrlInput(e.target.value)}
						placeholder="https://example.com/image.jpg"
						className="url-input"
					/>
					<button type="button" onClick={handleUrlSubmit} className="url-btn">
						Use URL
					</button>
				</div>
			)}

			{preview && (
				<div className="image-preview">
					<img src={preview} alt="Preview" onError={() => setError('Invalid image URL')} />
					<button type="button" onClick={handleRemoveImage} className="remove-btn">
						✕ Remove
					</button>
				</div>
			)}
		</div>
	);
}
