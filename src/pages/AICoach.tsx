import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sparkles, 
  Loader2,
  Copy,
  CheckCircle2,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import MobileLayout from '@/components/MobileLayout';
import AppHeader from '@/components/AppHeader';

interface SavedGrant {
  grant_id: string;
  grant: {
    id: string;
    name: string;
  };
}

const AICoach = () => {
  const { user } = useAuth();
  const [savedGrants, setSavedGrants] = useState<SavedGrant[]>([]);
  const [selectedGrantId, setSelectedGrantId] = useState<string>('general');
  const [question, setQuestion] = useState('');
  const [roughAnswer, setRoughAnswer] = useState('');
  const [polishedAnswer, setPolishedAnswer] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      loadSavedGrants();
    }
  }, [user]);

  const loadSavedGrants = async () => {
    try {
      const { data } = await supabase
        .from('user_grants')
        .select(`
          grant_id,
          grants!inner (
            id,
            name
          )
        `)
        .eq('user_id', user?.id);

      if (data) {
        setSavedGrants(data.map(d => ({
          grant_id: d.grant_id,
          grant: d.grants as any
        })));
      }
    } catch (error) {
      console.error('Error loading grants:', error);
    }
  };

  const handlePolish = async () => {
    if (!question.trim() || !roughAnswer.trim()) {
      toast.error('Please enter both a question and your answer');
      return;
    }

    setLoading(true);
    setPolishedAnswer('');
    setSuggestions([]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-answer-coach', {
        body: {
          question,
          roughAnswer,
          grantId: selectedGrantId !== 'general' ? selectedGrantId : null
        }
      });

      if (error) throw error;

      setPolishedAnswer(data.polishedAnswer || '');
      setSuggestions(data.suggestions || []);

      // Save session if user is logged in
      if (user) {
        await supabase.from('ai_coaching_sessions').insert({
          user_id: user.id,
          grant_id: selectedGrantId !== 'general' ? selectedGrantId : null,
          original_question: question,
          user_rough_answer: roughAnswer,
          ai_polished_answer: data.polishedAnswer,
          suggestions: data.suggestions?.join('\n')
        });
      }

      toast.success('Answer polished!');
    } catch (error: any) {
      console.error('Error polishing answer:', error);
      if (error.message?.includes('429') || error.message?.includes('rate')) {
        toast.error('Rate limit reached. Please try again in a moment.');
      } else if (error.message?.includes('402')) {
        toast.error('AI credits depleted. Please try again later.');
      } else {
        toast.error('Failed to polish answer. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(polishedAnswer);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setQuestion('');
    setRoughAnswer('');
    setPolishedAnswer('');
    setSuggestions([]);
  };

  return (
    <MobileLayout>
      <AppHeader />
      
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-5 md:space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            AI Answer Coach
          </h1>
          <p className="text-muted-foreground">
            Get help crafting winning grant application answers
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Grant Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Grant (optional)
              </label>
              <Select value={selectedGrantId} onValueChange={setSelectedGrantId}>
                <SelectTrigger>
                  <SelectValue placeholder="General question" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General question</SelectItem>
                  {savedGrants.map(sg => (
                    <SelectItem key={sg.grant_id} value={sg.grant_id}>
                      {sg.grant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Grant Question / Prompt
              </label>
              <Textarea
                placeholder="Paste the question from the grant application..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
              />
            </div>

            {/* Rough Answer */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Draft Answer
              </label>
              <Textarea
                placeholder="Write your rough answer here. Don't worry about making it perfect - just get your ideas down..."
                value={roughAnswer}
                onChange={(e) => setRoughAnswer(e.target.value)}
                rows={6}
              />
            </div>

            <Button 
              onClick={handlePolish} 
              disabled={loading || !question.trim() || !roughAnswer.trim()}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Polishing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Polish My Answer
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {polishedAnswer && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-status-success" />
                    Polished Answer
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopy}
                    className="gap-1"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-status-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{polishedAnswer}</p>
                </div>
              </CardContent>
            </Card>

            {suggestions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-accent" />
                    Improvement Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {suggestions.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-accent font-medium">•</span>
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Button 
              variant="outline" 
              onClick={handleReset}
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Start New
            </Button>
          </>
        )}

        {/* Tips for first-time users */}
        {!polishedAnswer && (
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="pt-4">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-accent" />
                Tips for Better Results
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Include specific numbers and achievements</li>
                <li>• Mention your business's unique qualities</li>
                <li>• Focus on impact and outcomes</li>
                <li>• Be authentic - AI will enhance, not replace your voice</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
};

export default AICoach;
