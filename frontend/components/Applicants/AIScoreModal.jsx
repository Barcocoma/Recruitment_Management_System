import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BrainCircuit, CheckCircle2, XCircle, AlertCircle, TrendingUp, FileText, Award, Briefcase } from 'lucide-react';

export const AIScoreModal = ({ isOpen, onClose, applicant, scoreBreakdown, resumeAnalysis }) => {
  if (!isOpen || !applicant) return null;

  const aiScore = applicant.ai_score || applicant.aiScore || 0;
  const breakdown = scoreBreakdown || {};
  const analysis = resumeAnalysis || {};

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-emerald-50';
    if (score >= 70) return 'bg-blue-50';
    if (score >= 50) return 'bg-amber-50';
    return 'bg-red-50';
  };

  const recommendation = breakdown.recommendation || 'Weak Match';
  const skills = analysis.skills || [];
  const experienceYears = analysis.experience_years || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-white border-b-2 border-slate-200 px-8 py-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                    <BrainCircuit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Resume Assessment Report</h2>
                    <p className="text-sm text-slate-600 font-medium mt-0.5">Candidate: {applicant.name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Overall Score */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-8 border border-slate-300 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Overall Assessment Score</span>
                      <div className="flex items-baseline gap-3 mt-2">
                        <span className={`text-6xl font-bold ${getScoreColor(aiScore)}`}>{aiScore}</span>
                        <span className="text-xl text-slate-500 font-medium">/ 100</span>
                      </div>
                    </div>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getScoreBg(aiScore)} border-4 ${getScoreColor(aiScore)} border-current shadow-lg`}>
                      <TrendingUp className={`w-10 h-10 ${getScoreColor(aiScore)}`} />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-300">
                    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-md text-sm font-semibold border-2 ${
                      recommendation === 'Strong Match' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      recommendation === 'Moderate Match' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                      recommendation === 'Invalid Resume' ? 'bg-red-50 text-red-800 border-red-300' :
                      'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {recommendation === 'Strong Match' && <CheckCircle2 className="w-4 h-4" />}
                      {recommendation === 'Moderate Match' && <AlertCircle className="w-4 h-4" />}
                      {(recommendation === 'Weak Match' || recommendation === 'Invalid Resume') && <XCircle className="w-4 h-4" />}
                      <span className="uppercase tracking-wide text-xs">{recommendation}</span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                {breakdown.breakdown && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-300">
                      <FileText className="w-5 h-5 text-slate-700" />
                      <h3 className="text-xl font-bold text-slate-900">Evaluation Criteria</h3>
                    </div>
                    
                    {/* Skills Match */}
                    <div className="bg-white border-2 border-slate-200 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Award className="w-5 h-5 text-slate-700" />
                          </div>
                          <div>
                            <span className="text-base font-bold text-slate-900">Technical Skills Assessment</span>
                            <p className="text-xs text-slate-500 mt-0.5">Evaluation of candidate's technical competencies</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-slate-800">
                            {breakdown.breakdown.skill_score !== undefined ? Math.round(breakdown.breakdown.skill_score) : 0}
                          </span>
                          <span className="text-sm text-slate-500"> / 60</span>
                        </div>
                      </div>
                      <div className="text-sm text-slate-600 mb-3 pl-13">
                        <span className="font-medium">Matching Skills Identified:</span> {breakdown.breakdown.skills_match || 0}
                      </div>
                      {/* Explanation for Skills Match */}
                      {(() => {
                        const skillScore = breakdown.breakdown.skill_score !== undefined ? Math.round(breakdown.breakdown.skill_score) : 0;
                        const matchedCount = breakdown.breakdown.matched_skills?.length || 0;
                        const missingCount = breakdown.breakdown.missing_skills?.length || 0;
                        const isPassed = skillScore >= 30; // At least 50% of max 60 points
                        
                        return (
                          <div className={`mt-4 p-4 rounded-md border-l-4 ${
                            isPassed 
                              ? 'bg-emerald-50/50 border-emerald-500 text-slate-800' 
                              : 'bg-amber-50/50 border-amber-500 text-slate-800'
                          }`}>
                            <div className="flex items-start gap-3">
                              {isPassed ? (
                                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-emerald-600" />
                              ) : (
                                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600" />
                              )}
                              <div className="text-sm leading-relaxed">
                                {isPassed ? (
                                  <div>
                                    <p className="font-semibold text-slate-900 mb-1">Assessment: Qualified</p>
                                    <p className="text-slate-700">
                                      The candidate demonstrates proficiency in {matchedCount} technical skill{matchedCount !== 1 ? 's' : ''} that align with the position requirements. 
                                      {matchedCount >= 8 ? ' This represents an exceptional technical skills match for the role.' : matchedCount >= 5 ? ' The candidate shows strong technical alignment with the position.' : ' The candidate meets the minimum technical qualifications.'}
                                    </p>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="font-semibold text-slate-900 mb-1">Assessment: Insufficient Qualifications</p>
                                    <p className="text-slate-700">
                                      The candidate lacks {missingCount} critical technical skill{missingCount !== 1 ? 's' : ''} required for this position ({breakdown.breakdown.missing_skills?.slice(0, 3).join(', ')}{missingCount > 3 ? ', and others' : ''}). 
                                      {matchedCount > 0 ? ` While the candidate possesses ${matchedCount} relevant skill${matchedCount !== 1 ? 's' : ''}, the absence of these essential competencies may impact their ability to perform effectively in this role.` : ' The candidate does not meet the minimum technical requirements for this position.'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pl-13">
                          {skills.slice(0, 10).map((skill, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-md text-xs font-medium text-slate-700">
                              {skill}
                            </span>
                          ))}
                          {skills.length > 10 && (
                            <span className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium text-slate-500">
                              +{skills.length - 10} additional
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Experience */}
                    <div className="bg-white border-2 border-slate-200 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-slate-700" />
                          </div>
                          <div>
                            <span className="text-base font-bold text-slate-900">Professional Experience</span>
                            <p className="text-xs text-slate-500 mt-0.5">Years of relevant work experience</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-slate-800">
                            {breakdown.breakdown.experience_score !== undefined ? breakdown.breakdown.experience_score : 0}
                          </span>
                          <span className="text-sm text-slate-500"> / 40</span>
                        </div>
                      </div>
                      <div className="text-sm text-slate-600 mb-3 pl-13">
                        <span className="font-medium">Total Experience:</span> {experienceYears} {experienceYears === 1 ? 'year' : 'years'} of professional experience
                      </div>
                      {/* Explanation for Experience */}
                      {(() => {
                        const expScore = breakdown.breakdown.experience_score !== undefined ? breakdown.breakdown.experience_score : 0;
                        const isPassed = expScore >= 20; // At least 50% of max 40 points
                        
                        return (
                          <div className={`mt-4 p-4 rounded-md border-l-4 ${
                            isPassed 
                              ? 'bg-emerald-50/50 border-emerald-500 text-slate-800' 
                              : experienceYears === 0
                              ? 'bg-red-50/50 border-red-500 text-slate-800'
                              : 'bg-amber-50/50 border-amber-500 text-slate-800'
                          }`}>
                            <div className="flex items-start gap-3">
                              {isPassed ? (
                                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-emerald-600" />
                              ) : (
                                <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
                              )}
                              <div className="text-sm leading-relaxed">
                                {isPassed ? (
                                  <div>
                                    <p className="font-semibold text-slate-900 mb-1">Assessment: Meets Requirements</p>
                                    <p className="text-slate-700">
                                      The candidate possesses {experienceYears} {experienceYears === 1 ? 'year' : 'years'} of professional experience, 
                                      {experienceYears >= 5 ? ' demonstrating advanced expertise and senior-level competency suitable for leadership responsibilities.' : experienceYears >= 3 ? ' indicating solid mid-level experience that aligns well with the position requirements.' : ' representing entry-level to junior experience that meets the minimum qualifications for this role.'}
                                    </p>
                                  </div>
                                ) : experienceYears === 0 ? (
                                  <div>
                                    <p className="font-semibold text-slate-900 mb-1">Assessment: Insufficient Experience</p>
                                    <p className="text-slate-700">
                                      No significant professional experience was identified in the candidate's resume. 
                                      The candidate may be entering the workforce or transitioning between career fields, which would necessitate additional onboarding, training, and mentorship to ensure successful performance in this role.
                                    </p>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="font-semibold text-slate-900 mb-1">Assessment: Below Recommended Level</p>
                                    <p className="text-slate-700">
                                      The candidate has {experienceYears} {experienceYears === 1 ? 'year' : 'years'} of professional experience, 
                                      which falls below the recommended experience level for this position. Additional experience would enhance the candidate's ability to effectively manage the role's responsibilities and contribute to organizational objectives.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                  </div>
                )}

                {/* Analysis Details */}
                {analysis && (
                  <div className="border-t-2 border-slate-300 pt-6">
                    <div className="flex items-center gap-2 mb-5">
                      <FileText className="w-5 h-5 text-slate-700" />
                      <h3 className="text-xl font-bold text-slate-900">Resume Analysis Summary</h3>
                    </div>
                    <div className="bg-slate-50 border border-slate-300 rounded-lg p-5 space-y-3">
                      {experienceYears > 0 ? (
                        <div className="flex items-center gap-3 text-sm text-slate-700 bg-white p-3 rounded-md border border-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span><strong className="font-semibold">{experienceYears} {experienceYears === 1 ? 'year' : 'years'}</strong> of professional experience identified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-sm text-slate-700 bg-white p-3 rounded-md border border-red-200">
                          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span>No professional experience detected in resume</span>
                        </div>
                      )}
                      {skills.length > 0 ? (
                        <div className="flex items-start gap-3 text-sm text-slate-700 bg-white p-3 rounded-md border border-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span><strong className="font-semibold">{skills.length} technical skill{skills.length !== 1 ? 's' : ''}</strong> identified in resume</span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 text-sm text-slate-700 bg-white p-3 rounded-md border border-red-200">
                          <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>No technical skills detected in resume</span>
                        </div>
                      )}
                      {analysis.education && analysis.education.length > 0 && (
                        <div className="flex items-center gap-3 text-sm text-slate-700 bg-white p-3 rounded-md border border-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>Educational background information identified</span>
                        </div>
                      )}
                      {analysis.error && (
                        <div className="flex items-center gap-3 text-sm text-red-700 bg-red-50 p-4 rounded-md border-2 border-red-300">
                          <XCircle className="w-5 h-5 flex-shrink-0" />
                          <span><strong className="font-semibold">Processing Error:</strong> {analysis.error}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Summary */}
                <div className="bg-slate-100 border-2 border-slate-300 rounded-lg p-6">
                  <h4 className="font-bold text-slate-900 mb-4 text-base">Scoring Methodology</h4>
                  <div className="bg-white border border-slate-300 rounded-md p-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-700 font-medium">Technical Skills Assessment:</span>
                      <span className="text-slate-900 font-bold">{breakdown.breakdown?.skill_score !== undefined ? Math.round(breakdown.breakdown.skill_score) : 0} / 60 points</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-700 font-medium">Professional Experience:</span>
                      <span className="text-slate-900 font-bold">{breakdown.breakdown?.experience_score !== undefined ? breakdown.breakdown.experience_score : 0} / 40 points</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-200">
                      <p className="text-xs text-slate-600 italic">Note: Scoring is based exclusively on technical skills alignment and professional experience. No base score is applied.</p>
                    </div>
                    {breakdown.breakdown?.reason && (
                      <div className="pt-2 mt-2 border-t border-red-200">
                        <p className="text-sm text-red-700 font-semibold">⚠️ {breakdown.breakdown.reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Explanation */}
                {breakdown.breakdown?.explanation && (
                  <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-slate-300">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5 text-slate-700" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Assessment Explanation</h3>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      <div className="text-sm text-slate-700 leading-relaxed space-y-3">
                        {breakdown.breakdown.explanation.split('. ').filter(part => part.trim()).map((sentence, idx) => {
                          // Format the explanation with proper styling
                          const isSuccess = sentence.includes('✅') || sentence.includes('🎯');
                          const isWarning = sentence.includes('⚠️') || sentence.includes('📋');
                          const isError = sentence.includes('❌');
                          const isInfo = sentence.includes('ℹ️') || sentence.includes('📊') || sentence.includes('💡');
                          
                          let bgColor = 'bg-white';
                          let borderColor = 'border-slate-200';
                          let textColor = 'text-slate-700';
                          
                          if (isSuccess) {
                            bgColor = 'bg-emerald-50';
                            borderColor = 'border-emerald-200';
                            textColor = 'text-emerald-900';
                          } else if (isWarning) {
                            bgColor = 'bg-amber-50';
                            borderColor = 'border-amber-200';
                            textColor = 'text-amber-900';
                          } else if (isError) {
                            bgColor = 'bg-red-50';
                            borderColor = 'border-red-200';
                            textColor = 'text-red-900';
                          } else if (isInfo) {
                            bgColor = 'bg-blue-50';
                            borderColor = 'border-blue-200';
                            textColor = 'text-blue-900';
                          }
                          
                          return (
                            <div
                              key={idx}
                              className={`${bgColor} ${borderColor} border-l-4 p-3 rounded-r-lg ${textColor}`}
                            >
                              <p className="font-medium m-0">
                                {sentence.replace(/✅|⚠️|❌|ℹ️|📊|🎯|💡/g, '').trim()}
                                {idx < breakdown.breakdown.explanation.split('. ').filter(part => part.trim()).length - 1 ? '.' : ''}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Additional Details */}
                    {(breakdown.breakdown?.matched_skills?.length > 0 || breakdown.breakdown?.missing_skills?.length > 0) && (
                      <div className="mt-5 pt-5 border-t-2 border-slate-300 space-y-4">
                        {breakdown.breakdown.matched_skills?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Matched Technical Skills ({breakdown.breakdown.matched_skills.length})
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {breakdown.breakdown.matched_skills.map((skill, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-md text-xs font-semibold">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {breakdown.breakdown.missing_skills?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              Missing Required Skills ({breakdown.breakdown.missing_skills.length})
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {breakdown.breakdown.missing_skills.map((skill, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-800 rounded-md text-xs font-semibold">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gradient-to-r from-slate-50 to-white border-t-2 border-slate-300 px-8 py-5 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-8 py-2.5 bg-slate-800 text-white rounded-md font-semibold hover:bg-slate-900 transition-colors shadow-sm"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

