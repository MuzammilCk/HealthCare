import { useState } from 'react';
import { Activity, AlertTriangle, User, Calendar, Loader2, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { AppSelect, Button, Badge } from '../../components/ui';

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

  const getProbabilityVariant = (probability) => {
    switch (probability.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'outline';
    }
  };

  const resetForm = () => {
    setFormData({ symptoms: '', age: '', sex: '' });
    setResults(null);
    setError('');
  };

  return (
    <div className="space-y-6 bg-background text-foreground">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center justify-center w-16 h-16 bg-brand-cyan/15 rounded-2xl">
            <Activity className="w-8 h-8 text-brand-cyan-fg" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Symptom Checker</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Get preliminary insights about your symptoms using AI technology. This tool provides informational guidance only and should not replace professional medical advice.
        </p>
      </div>

      {/* Important Disclaimer */}
      <div className="bg-amber-400/10 border border-amber-500/20 rounded-xl p-4 transition-colors duration-300">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-600 mb-1">Important Medical Disclaimer</h3>
            <p className="text-sm text-muted-foreground">
              This AI tool is for informational purposes only and does not provide medical diagnosis.
              Always consult with a qualified healthcare professional for proper medical evaluation and treatment.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="glass rounded-2xl shadow-card border border-border p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-cyan-fg" />
            Tell us about your symptoms
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Symptoms Input */}
            <div>
              <label htmlFor="symptoms" className="block text-sm font-medium text-muted-foreground mb-2">
                Describe your symptoms in detail
              </label>
              <textarea
                id="symptoms"
                name="symptoms"
                rows={4}
                value={formData.symptoms}
                onChange={handleInputChange}
                placeholder="e.g., I have been experiencing headaches, nausea, and sensitivity to light for the past 2 days..."
                className="w-full px-4 py-3 border border-border rounded-xl bg-background/60 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan resize-none shadow-sm"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Be as specific as possible about your symptoms, duration, and severity.
              </p>
            </div>

            {/* Age and Sex */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
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
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background/60 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan shadow-sm"
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
              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-error-fg" />
                  <p className="text-sm text-error-fg">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing symptoms...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Check Symptoms
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="glass rounded-2xl shadow-card border border-border p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success-fg" />
            Analysis Results
          </h2>

          {!results && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Enter your symptoms and click "Check Symptoms" to get AI-powered insights.
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-brand-cyan/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-brand-cyan-fg animate-spin" />
              </div>
              <p className="text-foreground font-medium">Analyzing your symptoms...</p>
              <p className="text-sm text-muted-foreground mt-1">This may take a few seconds</p>
            </div>
          )}

          {results && (
              <div className="space-y-6">
              {/* Potential Conditions */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Potential Conditions</h3>
                <div className="space-y-3">
                  {results.potentialConditions?.map((condition, index) => (
                      <div key={index} className="border border-border rounded-lg p-4 bg-foreground/5">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground">{condition.name}</h4>
                        <Badge variant={getProbabilityVariant(condition.probability)}>
                          {condition.probability} Probability
                        </Badge>
                      </div>
                        <p className="text-sm text-muted-foreground">{condition.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* First Aid Suggestion */}
              {results.firstAidSuggestion && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <h3 className="font-semibold text-success-fg mb-2">General Care Suggestion</h3>
                  <p className="text-sm text-muted-foreground">{results.firstAidSuggestion}</p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-foreground/5 border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground font-medium">{results.disclaimer}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Check New Symptoms
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex-1"
                >
                  Print Results
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
