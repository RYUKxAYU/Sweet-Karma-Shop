import { useState, useRef } from 'react';
import './ImageUpload.css';

const API_BASE = 'http://localhost:8000';

export function ImageUpload({ onImageUploaded, currentImageUrl }) {
	const [preview, setPreview] = useState(currentImageUrl || null);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState(null);
	const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
	const [urlInput, setUrlInput] = useState('');
	const fileInputRef = useRef(null);

	const handleFileSelect = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// Validate file type
		const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
		if (!validTypes.includes(file.type)) {
			setError('Invalid file type. Use PNG, JPG, GIF, or WebP.');
			return;
		}

		// Validate file size (5MB max)
		if (file.size > 5 * 1024 * 1024) {
			setError('File too large. Maximum 5MB.');
			return;
		}

		// Show preview immediately
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreview(reader.result);
		};
		reader.readAsDataURL(file);

		// Upload file
		setIsUploading(true);
		setError(null);

		const formData = new FormData();
		formData.append('file', file);

		try {
			const token = localStorage.getItem('token');
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
			setError(err.message);
			setPreview(null);
		} finally {
			setIsUploading(false);
		}
	};

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
	};

	return (
		<div className="image-upload">
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

			{uploadMode === 'file' ? (
				<div className="file-upload-area">
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileSelect}
						accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
						className="file-input"
						id="image-file-input"
					/>
					<label htmlFor="image-file-input" className="file-label">
						{isUploading ? (
							<span className="uploading">⟳ Uploading...</span>
						) : (
							<>
								<span className="upload-icon">📷</span>
								<span>Click to upload or drag & drop</span>
								<span className="hint">PNG, JPG, GIF, WebP (max 5MB)</span>
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
