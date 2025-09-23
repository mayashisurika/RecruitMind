import React, { useState, useEffect } from 'react';
import { X, Download, User, Brain, Target, Video, CheckCircle, AlertCircle, Clock, Play, BarChart3 } from 'lucide-react';

interface CandidateReportProps {
  candidateId: string;
  onClose: () => void;
}

interface ReportData {
  candidate_info: {
    id: string;
    name: string;
    email: string;
    created_at: any;
    active: boolean;
  };
  mbti_results?: {
    confidence?: string;
    final_mbti_type?: string;
    // results?: {
    //   personality_type?: string;
    //   dimensions?: any;
    //   characteristics?: string[];
    //   strengths?: string[];
    //   potential_careers?: string[];
    // };
  };
  leadership_results?: {
    feedback?: {
      effectiveness_feedback?: string;
      flexibility_feedback?: string;
      primary_style_description?: string;
    };
    scores?: {
      primary_style?: number;
    };
    results?: {
      scores?: Record<string, number>;
      total_score?: number;
      leadership_level?: string;
      recommendations?: string[];
    };
  };
  video_analysis?: {
     analysis_result?: {
      analysis?: {
        confidence_level?: string;
        dominant_emotion?: string;
        message?: string;
      };
    };
  };
  video_submissions?: {
    video_url?: string;
    emotions?: Record<string, number>;
    dominant_emotion?: string;
    timestamp?: any;
    status?: string;
  };
  hr_insights: {
    overall_recommendation: string;
    key_strengths: string[];
    areas_for_development: string[];
    personality_summary: string;
    leadership_potential: string;
    interview_performance: string;
    cultural_fit_score: number;
    role_suitability: string;
    next_steps: string[];
  };
  completion_status: {
    mbti_completed: boolean;
    leadership_completed: boolean;
    video_completed: boolean;
    overall_completion: number;
  };
}

const CandidateReport: React.FC<CandidateReportProps> = ({ candidateId, onClose }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [candidateId]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/v1/reports/${candidateId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      const data = await response.json();
      console.log('Report data:', data); // Debug log
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // Create a printable version
    const printContent = document.getElementById('report-content');
    if (printContent) {
      const newWindow = window.open('', '_blank');
      newWindow?.document.write(`
        <html>
          <head>
            <title>${reportData?.candidate_info.name} - Assessment Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { border-bottom: 2px solid #47684C; padding-bottom: 20px; margin-bottom: 30px; }
              .section { margin-bottom: 30px; page-break-inside: avoid; }
              .section h2 { color: #47684C; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .score-bar { background: #f0f0f0; height: 20px; border-radius: 10px; position: relative; }
              .score-fill { background: #47684C; height: 100%; border-radius: 10px; }
              @media print { body { margin: 0; } .no-print { display: none; } }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      newWindow?.document.close();
      newWindow?.print();
    }
  };

  const getCompletionColor = (completed: boolean) => {
    return completed ? 'text-green-600' : 'text-orange-600';
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.includes('Highly Recommended')) return 'bg-green-100 text-green-800';
    if (recommendation.includes('Recommended')) return 'bg-blue-100 text-blue-800';
    if (recommendation.includes('Consider')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: 'text-green-600 bg-green-50',
      neutral: 'text-blue-600 bg-blue-50',
      surprised: 'text-yellow-600 bg-yellow-50',
      sad: 'text-red-600 bg-red-50',
      angry: 'text-red-700 bg-red-100',
      fearful: 'text-purple-600 bg-purple-50',
      disgusted: 'text-orange-600 bg-orange-50'
    };
    return colors[emotion.toLowerCase()] || 'text-gray-600 bg-gray-50';
  };

  const formatConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return { text: 'High', color: 'text-green-600' };
    if (confidence >= 0.6) return { text: 'Medium', color: 'text-yellow-600' };
    return { text: 'Low', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#47684C] mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Report</h3>
            <p className="text-gray-600">Please wait while we compile the assessment data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Report</h3>
            <p className="text-gray-600 mb-4">{error || 'Failed to load candidate report'}</p>
            <button
              onClick={onClose}
              className="bg-[#47684C] text-white px-4 py-2 rounded-lg hover:bg-[#3a5640] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { candidate_info, mbti_results, leadership_results, video_analysis, video_submissions, hr_insights, completion_status } = reportData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#47684C] to-[#38533B] text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{candidate_info.name}</h2>
              <p className="text-green-100">{candidate_info.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-[#00335A] px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-[#00335A] p-2 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div id="report-content" className="p-6 space-y-8">
            {/* Assessment Status Overview */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Assessment Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Brain className={`w-5 h-5 ${getCompletionColor(completion_status.mbti_completed)}`} />
                  <span className={`font-medium ${getCompletionColor(completion_status.mbti_completed)}`}>
                    MBTI: {completion_status.mbti_completed ? 'Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className={`w-5 h-5 ${getCompletionColor(completion_status.leadership_completed)}`} />
                  <span className={`font-medium ${getCompletionColor(completion_status.leadership_completed)}`}>
                    Leadership: {completion_status.leadership_completed ? 'Complete' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Video className={`w-5 h-5 ${getCompletionColor(completion_status.video_completed)}`} />
                  <span className={`font-medium ${getCompletionColor(completion_status.video_completed)}`}>
                    Video: {completion_status.video_completed ? 'Complete' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Overall Completion</span>
                  <span>{completion_status.overall_completion}/3 assessments</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#47684C] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completion_status.overall_completion / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* HR Insights Summary */}
            <div className="bg-white border-2 border-[#47684C] rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">HR Assessment Summary</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(hr_insights.overall_recommendation)}`}>
                      {hr_insights.overall_recommendation}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Cultural Fit Score</p>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-[#47684C] h-3 rounded-full transition-all duration-300"
                          style={{ width: `${hr_insights.cultural_fit_score}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-gray-900">{hr_insights.cultural_fit_score}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Role Suitability</p>
                    <p className="font-medium text-gray-900">{hr_insights.role_suitability}</p>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Key Strengths</p>
                    <ul className="space-y-1">
                      {hr_insights.key_strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-900 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {hr_insights.areas_for_development.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Areas for Development</p>
                      <ul className="space-y-1">
                        {hr_insights.areas_for_development.map((area, index) => (
                          <li key={index} className="text-sm text-gray-900 flex items-center">
                            <AlertCircle className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assessment Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* MBTI Results */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-600" />
                  MBTI Assessment
                </h4>
                {mbti_results ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-green-600 mb-1">Complete</p>
                    <p className="text-sm text-gray-600">Assessment submitted</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-gray-600 mb-1">Pending</p>
                    <p className="text-sm text-gray-600">Assessment not completed</p>
                  </div>
                )}
              </div>

              {/* Leadership Results */}
              <div className="bg-green-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  Leadership Assessment
                </h4>
                {leadership_results ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-green-600 mb-1">Complete</p>
                    <p className="text-sm text-gray-600">Assessment submitted</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-gray-600 mb-1">Pending</p>
                    <p className="text-sm text-gray-600">Assessment not completed</p>
                  </div>
                )}
              </div>

              {/* Video Analysis */}
              <div className="bg-purple-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-purple-600" />
                  Video Analysis
                </h4>
                {video_analysis ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-green-600 mb-1">Complete</p>
                    <p className="text-sm text-gray-600">Video analyzed</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-gray-600 mb-1">Pending</p>
                    <p className="text-sm text-gray-600">Video not analyzed</p>
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            {hr_insights.next_steps.length > 0 && (
              <div className="bg-orange-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommended Next Steps</h3>
                <ul className="space-y-2">
                  {hr_insights.next_steps.map((step, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-orange-600 font-semibold text-xs">{index + 1}</span>
                      </div>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Enhanced Performance Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* MBTI Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-blue-600" />
                  Personality Analysis
                </h4>
                {mbti_results ? (
                  <div className="space-y-3">
                    {mbti_results.final_mbti_type && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">MBTI Type</p>
                        <p className="text-lg font-bold text-blue-600">
                          {mbti_results.final_mbti_type}
                        </p>
                      </div>
                    )}
                    {mbti_results.confidence && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Confidence Level</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {mbti_results.confidence}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{hr_insights.personality_summary}</p>
                )}
              </div>


              {/* Leadership Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-green-600" />
                  Leadership Assessment
                </h4>
                {leadership_results ? (
                  <div className="space-y-3">
                    {leadership_results.scores?.primary_style && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Primary Leadership Style</p>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-green-600" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(leadership_results.scores.primary_style / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {leadership_results.scores.primary_style}/5
                          </span>
                        </div>
                      </div>
                    )}
                    {leadership_results.feedback && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Leadership Feedback</p>
                        <div className="space-y-2">
                          {leadership_results.feedback.effectiveness_feedback && (
                            <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              <span className="font-medium text-gray-900">Effectiveness: </span>
                              {leadership_results.feedback.effectiveness_feedback.length > 80 
                                ? `${leadership_results.feedback.effectiveness_feedback.substring(0, 80)}...` 
                                : leadership_results.feedback.effectiveness_feedback}
                            </div>
                          )}
                          {leadership_results.feedback.flexibility_feedback && (
                            <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              <span className="font-medium text-gray-900">Flexibility: </span>
                              {leadership_results.feedback.flexibility_feedback.length > 80 
                                ? `${leadership_results.feedback.flexibility_feedback.substring(0, 80)}...` 
                                : leadership_results.feedback.flexibility_feedback}
                            </div>
                          )}
                          {leadership_results.feedback.primary_style_description && (
                            <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              <span className="font-medium text-gray-900">Style: </span>
                              {leadership_results.feedback.primary_style_description.length > 80 
                                ? `${leadership_results.feedback.primary_style_description.substring(0, 80)}...` 
                                : leadership_results.feedback.primary_style_description}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{hr_insights.leadership_potential}</p>
                )}
              </div>

              {/* Video Analysis Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Video className="w-4 h-4 mr-2 text-purple-600" />
                  Video Interview Analysis
                </h4>
                {video_analysis ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Confidence Level
                      </p>
                      <span className="text-sm font-medium text-gray-700">
                        {video_analysis.analysis_result?.analysis?.confidence_level ?? "N/A"}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Dominant Emotion
                      </p>
                      <span className="px-2 py-1 rounded-full text-xs font-medium capitalize bg-purple-100 text-purple-700">
                        {video_analysis.analysis_result?.analysis?.dominant_emotion ?? "N/A"}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Message
                      </p>
                      <p className="text-sm text-gray-700">
                        {video_analysis.analysis_result?.analysis?.message ?? "N/A"}
                      </p>
                    </div>
                    
                    {video_submissions && video_submissions.video_url ? (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Video Recording
                        </p>
                        <button
                          onClick={() => window.open(video_submissions.video_url, '_blank')}
                          className="flex items-center space-x-2 bg-purple-100 hover:bg-purple-200
                                    text-purple-700 px-3 py-2 rounded-lg text-sm font-medium
                                    transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          <span>Watch Interview</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No video submitted</p>
                    )}

                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{hr_insights.interview_performance}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center py-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Report generated on {new Date().toLocaleDateString()} • RecruitMind Assessment Platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateReport;