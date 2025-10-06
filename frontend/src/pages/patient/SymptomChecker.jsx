import { useState } from 'react';
import { FiActivity, FiAlertTriangle, FiUser, FiCalendar, FiLoader, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';
import { AppSelect } from '../../components/ui';

export default function SymptomChecker() {
  const [formData, setFormData] = useState({
    symptoms: '',
    age: '',
    sex: ''
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.symptoms.trim()) {
      setError('Please describe your symptoms');
      return;
    }
    if (!formData.age || formData.age < 1 || formData.age > 120) {
      setError('Please enter a valid age between 1 and 120');
      return;
    }
    if (!formData.sex) {
      setError('Please select your sex');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await api.post('/ai/check-symptoms', {
        symptoms: formData.symptoms.trim(),
        age: parseInt(formData.age),
        sex: formData.sex
      });

      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setError(response.data.message || 'Failed to analyze symptoms');
      }
    } catch (err) {
      console.error('Symptom check error:', err);
      if (err.response?.data?.error === 'invalid_input') {
        setError(err.response.data.message);
      } else {
        setError(err.response?.data?.message || 'Failed to analyze symptoms. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getProbabilityColor = (probability) => {
    switch (probability.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const resetForm = () => {
    setFormData({ symptoms: '', age: '', sex: '' });
    setResults(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl">
            <FiActivity className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary-dark">Symptom Checker</h1>
        </div>
        <p className="text-gray-600 dark:text-text-secondary-dark max-w-2xl">
          Get preliminary insights about your symptoms using AI technology. This tool provides informational guidance only and should not replace professional medical advice.
        </p>
      </div>

      {/* Important Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 transition-colors duration-300">
        <div className="flex items-start gap-3">
          <FiAlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Important Medical Disclaimer</h3>
            <p className="text-sm text-amber-700 dark:text-amber-200/90">
              This AI tool is for informational purposes only and does not provide medical diagnosis. 
              Always consult with a qualified healthcare professional for proper medical evaluation and treatment.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white dark:bg-bg-card-dark rounded-2xl shadow-xl dark:shadow-card-dark shadow-slate-900/5 border border-slate-200/60 dark:border-dark-border p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-text-primary-dark mb-6 flex items-center gap-2">
            <FiUser className="w-5 h-5 text-blue-600" />
            Tell us about your symptoms
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Symptoms Input */}
            <div>
              <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 dark:text-text-secondary-dark mb-2">
                Describe your symptoms in detail
              </label>
              <textarea
                id="symptoms"
                name="symptoms"
                rows={4}
                value={formData.symptoms}
                onChange={handleInputChange}
                placeholder="e.g., I have been experiencing headaches, nausea, and sensitivity to light for the past 2 days..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-surface text-gray-900 dark:text-text-primary-dark placeholder:text-gray-400 dark:placeholder:text-text-secondary-dark focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none shadow-sm"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 dark:text-text-secondary-dark mt-1">
                Be as specific as possible about your symptoms, duration, and severity.
              </p>
            </div>

            {/* Age and Sex */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-text-secondary-dark mb-2">
                  <FiCalendar className="w-4 h-4 inline mr-1" />
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Enter your age"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-surface text-gray-900 dark:text-text-primary-dark placeholder:text-gray-400 dark:placeholder:text-text-secondary-dark focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                  disabled={loading}
                />
              </div>

              <div>
                <AppSelect
                  label="Sex"
                  placeholder="Select sex"
                  value={formData.sex}
                  onChange={(val) => setFormData(prev => ({ ...prev, sex: val }))}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' }
                  ]}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <FiAlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Analyzing symptoms...
                </>
              ) : (
                <>
                  <FiActivity className="w-4 h-4" />
                  Check Symptoms
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="bg-white dark:bg-bg-card-dark rounded-2xl shadow-xl dark:shadow-card-dark shadow-slate-900/5 border border-slate-200/60 dark:border-dark-border p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-text-primary-dark mb-6 flex items-center gap-2">
            <FiCheckCircle className="w-5 h-5 text-green-600" />
            Analysis Results
          </h2>

          {!results && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-dark-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <FiActivity className="w-8 h-8 text-gray-400 dark:text-text-secondary-dark" />
              </div>
              <p className="text-gray-500 dark:text-text-secondary-dark">
                Enter your symptoms and click "Check Symptoms" to get AI-powered insights.
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <p className="text-gray-600 font-medium">Analyzing your symptoms...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
            </div>
          )}

          {results && (
              <div className="space-y-6">
              {/* Potential Conditions */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-text-primary-dark mb-4">Potential Conditions</h3>
                <div className="space-y-3">
                  {results.potentialConditions?.map((condition, index) => (
                      <div key={index} className="border border-gray-200 dark:border-dark-border rounded-lg p-4 bg-white dark:bg-dark-surface">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-text-primary-dark">{condition.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getProbabilityColor(condition.probability)}`}>
                          {condition.probability} Probability
                        </span>
                      </div>
                        <p className="text-sm text-gray-600 dark:text-text-secondary-dark">{condition.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* First Aid Suggestion */}
              {results.firstAidSuggestion && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">General Care Suggestion</h3>
                  <p className="text-sm text-green-700 dark:text-green-200/90">{results.firstAidSuggestion}</p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-text-secondary-dark font-medium">{results.disclaimer}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-text-primary-dark py-2 px-4 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-dark-surface-hover transition-colors duration-200"
                >
                  Check New Symptoms
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 py-2 px-4 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors duration-200"
                >
                  Print Results
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
