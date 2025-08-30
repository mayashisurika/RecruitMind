import React, { useState, useEffect } from 'react';
import { X, Download, User, Brain, Target, Video, CheckCircle, AlertCircle, Clock } from 'lucide-react';

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
    results: {
      personality_type: string;
      dimensions: any;
      characteristics: string[];
      strengths: string[];
      potential_careers: string[];
    };
  };
  leadership_results?: {
    results: {
      scores: Record<string, number>;
      total_score: number;
      leadership_level: string;
      recommendations: string[];
    };
  };
  video_analysis?: {
    results: {
      emotion_summary: Record<string, number>;
      average_confidence: number;
      insights: string[];
      recommendations: string[];
    };
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

  const { candidate_info, mbti_results, leadership_results, video_analysis, hr_insights, completion_status } = reportData;

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
                  <div>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {mbti_results.results.personality_type}
                      </div>
                      <p className="text-sm text-gray-600">Personality Type</p>
                    </div>
                    {mbti_results.results.strengths && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Key Strengths:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {mbti_results.results.strengths.slice(0, 3).map((strength, index) => (
                            <li key={index} className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
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
                  <div>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {leadership_results.results.total_score ? leadership_results.results.total_score.toFixed(1) : 'N/A'}
                      </div>
                      <p className="text-sm text-gray-600">Overall Score</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Leadership Level:</p>
                      <p className="text-sm text-green-600 font-medium">
                        {leadership_results.results.leadership_level || 'Evaluating'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
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
                  <div>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {Math.round(video_analysis.results.average_confidence * 100)}%
                      </div>
                      <p className="text-sm text-gray-600">Confidence Level</p>
                    </div>
                    {video_analysis.results.emotion_summary && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Emotional Profile:</p>
                        <div className="space-y-2">
                          {Object.entries(video_analysis.results.emotion_summary).slice(0, 3).map(([emotion, value]) => (
                            <div key={emotion} className="flex items-center justify-between text-xs">
                              <span className="capitalize text-gray-600">{emotion}</span>
                              <span className="font-medium text-purple-600">{Math.round(value * 100)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
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

            {/* Performance Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Personality Summary</h4>
                <p className="text-sm text-gray-600">{hr_insights.personality_summary}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Leadership Potential</h4>
                <p className="text-sm text-gray-600">{hr_insights.leadership_potential}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Interview Performance</h4>
                <p className="text-sm text-gray-600">{hr_insights.interview_performance}</p>
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