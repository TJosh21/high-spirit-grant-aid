-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.grant_status AS ENUM ('open', 'coming_soon', 'closed');
CREATE TYPE public.answer_status AS ENUM ('not_started', 'in_progress', 'needs_clarification', 'ready');
CREATE TYPE public.doc_type AS ENUM ('business_plan', 'executive_summary', 'capability_statement', 'elevator_pitch', 'budget_overview', 'profit_and_loss_summary');
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro', 'elite');
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'trial');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT,
  business_industry TEXT,
  business_description TEXT,
  years_in_business INTEGER,
  annual_revenue_range TEXT,
  is_minority_owned BOOLEAN DEFAULT false,
  is_woman_owned BOOLEAN DEFAULT false,
  country TEXT,
  state_region TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Create grants table
CREATE TABLE public.grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  long_description TEXT,
  amount_min NUMERIC,
  amount_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  sponsor_name TEXT NOT NULL,
  sponsor_type TEXT,
  website_url TEXT,
  application_link TEXT,
  industry_tags TEXT[] DEFAULT '{}',
  geography_tags TEXT[] DEFAULT '{}',
  target_audience_tags TEXT[] DEFAULT '{}',
  business_stage_tags TEXT[] DEFAULT '{}',
  deadline DATE,
  status grant_status DEFAULT 'open',
  notes_for_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES public.grants(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  helper_text TEXT,
  word_limit INTEGER,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create answers table
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  grant_id UUID REFERENCES public.grants(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  question_text_snapshot TEXT NOT NULL,
  user_rough_answer TEXT,
  ai_clarification TEXT,
  user_clarification TEXT,
  ai_polished_answer TEXT,
  status answer_status DEFAULT 'not_started',
  last_ai_run_at TIMESTAMP WITH TIME ZONE,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Create business_documents table
CREATE TABLE public.business_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doc_type doc_type NOT NULL,
  title TEXT NOT NULL,
  ai_generated_content TEXT,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, doc_type)
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan subscription_plan DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status subscription_status DEFAULT 'active',
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grants_updated_at BEFORE UPDATE ON public.grants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_documents_updated_at BEFORE UPDATE ON public.business_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for grants
CREATE POLICY "Anyone can view open grants"
  ON public.grants FOR SELECT
  USING (status = 'open' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage grants"
  ON public.grants FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for questions
CREATE POLICY "Anyone can view questions for open grants"
  ON public.questions FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.grants
      WHERE grants.id = questions.grant_id
      AND (grants.status = 'open' OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admins can manage questions"
  ON public.questions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for answers
CREATE POLICY "Users can view their own answers"
  ON public.answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own answers"
  ON public.answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answers"
  ON public.answers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all answers"
  ON public.answers FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for business_documents
CREATE POLICY "Users can manage their own documents"
  ON public.business_documents FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_grants_status ON public.grants(status);
CREATE INDEX idx_grants_tags ON public.grants USING GIN(industry_tags, geography_tags, target_audience_tags);
CREATE INDEX idx_questions_grant_id ON public.questions(grant_id);
CREATE INDEX idx_answers_user_id ON public.answers(user_id);
CREATE INDEX idx_answers_grant_id ON public.answers(grant_id);
CREATE INDEX idx_answers_status ON public.answers(status);