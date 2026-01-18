'use client';

import { useRef, useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface Video {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
  views: number;
  trimmedUrl?: string;
  createdAt: string;
}

interface Analytics {
  summary?: {
    totalVideos: number;
    totalViews: number;
    mostViewedVideo?: {
      title: string;
      views: number;
    };
  };
  videos?: Array<{
    id: string;
    title: string;
    views: number;
    duration: number;
    fileSize: number;
    createdAt: string;
    lastViewed?: string;
  }>;
  title?: string;
  views?: number;
  status?: string;
  duration?: number;
  fileSize?: number;
  lastViewed?: string;
}

export default function ScreenRecorder() {
  // Recording state
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // Trim state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadedVideos, setUploadedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  // Video metadata
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');

  // Analytics state
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  // Media refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackedVideosRef = useRef(new Set<string>());

  // Fetch uploaded videos on mount
  useEffect(() => {
    fetchUploadedVideos();
    const interval = setInterval(fetchUploadedVideos, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get video duration when video is loaded
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setVideoDuration(Math.floor(duration));
      setTrimEnd(Math.floor(duration));
    }
  };

  // Fetch all uploaded videos
  const fetchUploadedVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/videos`);
      const data = await response.json();
      if (data.success) {
        setUploadedVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete video
  const deleteVideo = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setUploadMessage('✓ Video deleted successfully!');
        fetchUploadedVideos();
        setTimeout(() => setUploadMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      setUploadMessage('❌ Error deleting video');
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      let displayStream: MediaStream | null = null;
      let audioStream: MediaStream | null = null;

      try {
        // Try to get display stream with system audio
        displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' } as any,
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          } as any,
        });
      } catch (err) {
        console.warn('System audio not available, recording video only');
        displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' } as any,
        });
      }

      // Try to also capture microphone audio
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          } as any,
        });
      } catch (err) {
        console.warn('Microphone not available');
      }

      // Combine streams
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const combinedAudioTrack = audioContext.createMediaStreamDestination();

      if (displayStream.getAudioTracks().length > 0) {
        const displayAudio = audioContext.createMediaStreamSource(displayStream);
        displayAudio.connect(combinedAudioTrack);
      }

      if (audioStream) {
        const micAudio = audioContext.createMediaStreamSource(audioStream);
        micAudio.connect(combinedAudioTrack);
      }

      // Create final stream with video from display and combined audio
      const finalStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...combinedAudioTrack.stream.getAudioTracks(),
      ]);

      const mediaRecorder = new MediaRecorder(finalStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));

        // Stop all tracks
        finalStream.getTracks().forEach((track) => track.stop());
        if (audioStream) {
          audioStream.getTracks().forEach((track) => track.stop());
        }
        audioContext.close();
      };

      mediaRecorder.start();
      setRecording(true);
      setUploadMessage('🎙️ Recording with audio...');
    } catch (err: any) {
      console.error('Screen recording failed', err);
      setUploadMessage('❌ Recording failed: ' + err.message);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
    }
  };

  // Trim and upload video
  const trimAndUploadVideo = async () => {
    if (trimStart >= trimEnd) {
      setUploadMessage('⚠️ Trim start must be less than trim end');
      return;
    }

    if (!recordedBlob) {
      setUploadMessage('⚠️ No video to trim');
      return;
    }

    setProcessing(true);
    setUploadMessage('⏳ Processing...');

    try {
      const formData = new FormData();
      formData.append('video', recordedBlob, 'recording.webm');
      formData.append('title', videoTitle || 'Untitled Video');
      formData.append('description', videoDescription || '');
      formData.append('trimStart', trimStart.toString());
      formData.append('trimEnd', trimEnd.toString());

      const response = await fetch(`${API_BASE_URL}/videos/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadMessage('✅ Video trimmed and uploaded to cloud!');
        setVideoUrl(null);
        setRecordedBlob(null);
        setTrimStart(0);
        setTrimEnd(0);
        setVideoTitle('');
        setVideoDescription('');
        setVideoDuration(0);
        fetchUploadedVideos();
        setTimeout(() => setUploadMessage(''), 4000);
      } else {
        setUploadMessage(`❌ Error: ${data.message}`);
      }
    } catch (error: any) {
      console.error('Error uploading video:', error);
      setUploadMessage('❌ Error uploading video: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Reset and record new video
  const resetRecording = () => {
    setVideoUrl(null);
    setRecordedBlob(null);
    setTrimStart(0);
    setTrimEnd(0);
    setVideoTitle('');
    setVideoDescription('');
    setVideoDuration(0);
  };

  // Track video view
  const trackVideoView = async (videoId: string) => {
    if (trackedVideosRef.current.has(videoId)) return;

    try {
      trackedVideosRef.current.add(videoId);
      await fetch(`${API_BASE_URL}/videos/${videoId}/view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Get video analytics
  const getVideoAnalytics = async (videoId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/${videoId}/analytics`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
        setSelectedVideoId(videoId);
        setShowAnalytics(true);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Get all analytics
  const getAllAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/analytics/all`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data);
        setShowAnalytics(true);
      }
    } catch (error) {
      console.error('Error fetching all analytics:', error);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🎬 Screen Recorder & Video Trimmer</h1>
        <p>Record, trim, and upload videos to cloud storage</p>
        <button
          className="analytics-btn"
          onClick={getAllAnalytics}
          title="View All Analytics"
        >
          📊 Analytics
        </button>
      </header>

      <div className="main-content">
        {/* Recording Section */}
        <div className="section recorder-section">
          <h2>📹 Screen Recorder</h2>

          <div className="button-group">
            {!recording && !videoUrl && (
              <button className="btn btn-primary" onClick={startRecording}>
                Start Recording
              </button>
            )}

            {recording && (
              <button className="btn btn-danger" onClick={stopRecording}>
                Stop Recording
              </button>
            )}

            {videoUrl && (
              <button className="btn btn-secondary" onClick={resetRecording}>
                Record New Video
              </button>
            )}
          </div>

          {/* Video Preview */}
          {videoUrl && (
            <div className="video-preview">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                onLoadedMetadata={handleVideoLoadedMetadata}
              />

              {/* Trim Controls */}
              <div className="trim-controls">
                <div className="form-group">
                  <label>Video Title:</label>
                  <input
                    type="text"
                    placeholder="Enter video title"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    placeholder="Enter video description"
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                  />
                </div>

                <div className="trim-inputs">
                  <div className="form-group">
                    <label>Trim Start (seconds):</label>
                    <input
                      type="number"
                      min="0"
                      max={videoDuration}
                      value={trimStart}
                      onChange={(e) => setTrimStart(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Trim End (seconds):</label>
                    <input
                      type="number"
                      min="0"
                      max={videoDuration}
                      value={trimEnd}
                      onChange={(e) => setTrimEnd(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Video Duration: {videoDuration}s</label>
                  </div>
                </div>

                <button
                  className="btn btn-success"
                  onClick={trimAndUploadVideo}
                  disabled={processing}
                >
                  {processing ? '⏳ Trimming & Uploading...' : '✂️ Trim & Upload'}
                </button>

                {uploadMessage && <div className="message">{uploadMessage}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Uploaded Videos Section */}
        <div className="section videos-section">
          <h2>☁️ Uploaded Videos</h2>

          {loading ? (
            <p className="loading">Loading videos...</p>
          ) : uploadedVideos.length === 0 ? (
            <p className="empty-state">No videos uploaded yet</p>
          ) : (
            <div className="videos-grid">
              {uploadedVideos.map((video) => (
                <div key={video._id} className="video-card">
                  <div className="video-info">
                    <h3>{video.title}</h3>
                    <p className="description">{video.description || 'No description'}</p>
                    <div className="video-stats">
                      <span>Duration: {video.duration}s</span>
                      <span>Trimmed: {video.trimEnd - video.trimStart}s</span>
                      <span className="views-badge">👁️ {video.views || 0} views</span>
                    </div>
                    <p className="date">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {video.trimmedUrl && (
                    <div className="video-player">
                      <video
                        src={video.trimmedUrl}
                        controls
                        width="100%"
                        onPlay={() => trackVideoView(video._id)}
                      />
                    </div>
                  )}

                  <div className="video-actions">
                    {video.trimmedUrl && (
                      <a
                        href={video.trimmedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-small btn-info"
                      >
                        Download
                      </a>
                    )}
                    <button
                      className="btn btn-small btn-analytics"
                      onClick={() => getVideoAnalytics(video._id)}
                      title="View analytics for this video"
                    >
                      📊 Analytics
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => deleteVideo(video._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics Modal */}
        {showAnalytics && (
          <div className="modal-overlay" onClick={() => setShowAnalytics(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>📊 Video Analytics</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowAnalytics(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {analytics?.summary ? (
                  <div className="analytics-summary">
                    <div className="analytics-card">
                      <h3>Total Videos</h3>
                      <p className="big-number">{analytics.summary.totalVideos}</p>
                    </div>
                    <div className="analytics-card">
                      <h3>Total Views</h3>
                      <p className="big-number">{analytics.summary.totalViews}</p>
                    </div>
                    {analytics.summary.mostViewedVideo && (
                      <div className="analytics-card highlight">
                        <h3>Most Viewed</h3>
                        <p className="video-title">
                          {analytics.summary.mostViewedVideo.title}
                        </p>
                        <p className="big-number">
                          {analytics.summary.mostViewedVideo.views} views
                        </p>
                      </div>
                    )}

                    <h3 className="section-title">Videos Overview</h3>
                    <div className="analytics-table">
                      <div className="table-header">
                        <div>Title</div>
                        <div>Views</div>
                        <div>Duration</div>
                        <div>Created</div>
                        <div>Last Viewed</div>
                      </div>
                      {analytics.videos?.map((video) => (
                        <div key={video.id} className="table-row">
                          <div className="table-cell">{video.title}</div>
                          <div className="table-cell">{video.views}</div>
                          <div className="table-cell">{video.duration}s</div>
                          <div className="table-cell">
                            {new Date(video.createdAt).toLocaleDateString()}
                          </div>
                          <div className="table-cell">
                            {video.lastViewed
                              ? new Date(video.lastViewed).toLocaleString()
                              : 'Never'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="analytics-single">
                    <div className="analytics-card large">
                      <h3>{analytics?.title}</h3>
                      <p className="views-large">👁️ {analytics?.views} views</p>
                    </div>
                    <div className="analytics-details">
                      <div className="detail-row">
                        <span>Status:</span>
                        <strong>{analytics?.status}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Duration:</span>
                        <strong>{analytics?.duration}s</strong>
                      </div>
                      <div className="detail-row">
                        <span>File Size:</span>
                        <strong>
                          {analytics?.fileSize
                            ? (analytics.fileSize / 1024 / 1024).toFixed(2)
                            : 0}{' '}
                          MB
                        </strong>
                      </div>
                      <div className="detail-row">
                        <span>Created:</span>
                        <strong>
                          {analytics?.createdAt
                            ? new Date(analytics.createdAt).toLocaleString()
                            : 'N/A'}
                        </strong>
                      </div>
                      <div className="detail-row">
                        <span>Last Viewed:</span>
                        <strong>
                          {analytics?.lastViewed
                            ? new Date(analytics.lastViewed).toLocaleString()
                            : 'Never viewed'}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
