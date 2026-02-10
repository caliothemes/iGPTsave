import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, FileText, Image, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromptCreatorModal({ isOpen, onClose, onPromptGenerated, selectedCategory }) {
  const { language } = useLanguage();
  const [step, setStep] = useState('choice'); // 'choice', 'image', 'info'
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Image mode
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  
  // Info mode
  const [brandName, setBrandName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [activity, setActivity] = useState('');
  const [description, setDescription] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(language === 'fr' ? 'Veuillez sélectionner une image' : 'Please select an image');
      return;
    }

    setIsGenerating(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
      setUploadedImage(URL.createObjectURL(file));
    } catch (error) {
      console.error('Upload failed:', error);
      alert(language === 'fr' ? 'Erreur lors de l\'upload' : 'Upload error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromImage = async () => {
    if (!imageUrl) return;

    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert prompt engineer for image generation AI. Analyze this image in extreme detail and create a comprehensive, professional prompt that could recreate it.

Your prompt should include:
1. Main subject and composition (what is the focal point, how is it arranged)
2. Visual style and aesthetic (realistic, illustrated, abstract, minimalist, etc.)
3. Colors and lighting (color palette, lighting direction, mood)
4. Technical details (perspective, depth of field, camera angle)
5. Atmosphere and mood (emotions conveyed, overall feeling)
6. Art direction keywords (specific artistic movements, techniques, or styles)

The prompt must be:
- Detailed but concise (2-4 sentences)
- Professional and technical
- Ready to use with image generation AI
- In ${language === 'fr' ? 'French' : 'English'}

Return ONLY the generated prompt, nothing else.`,
        file_urls: [imageUrl]
      });

      onPromptGenerated(result);
      handleReset();
      onClose();
    } catch (error) {
      console.error('Generation failed:', error);
      alert(language === 'fr' ? 'Erreur lors de la génération' : 'Generation error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromInfo = async () => {
    if (!description.trim()) {
      alert(language === 'fr' ? 'Veuillez renseigner la description' : 'Please provide a description');
      return;
    }

    setIsGenerating(true);
    try {
      // Déterminer le type de visuel en fonction de la catégorie
      const categoryName = selectedCategory?.name?.[language] || selectedCategory?.name?.fr || '';
      const categoryId = selectedCategory?.id || '';
      
      let visualType = 'visual/design';
      if (categoryId.includes('logo')) {
        visualType = 'logo';
      } else if (categoryId === 'print') {
        visualType = 'print design (flyer, poster, business card)';
      } else if (categoryId === 'social') {
        visualType = 'social media post';
      } else if (categoryId === 'mockup') {
        visualType = 'product mockup';
      } else if (categoryId === 'image') {
        visualType = 'image/visual';
      } else if (categoryId === 'design_3d') {
        visualType = '3D design';
      } else if (categoryId === 'pub_ads') {
        visualType = 'advertising visual';
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert creative director and prompt engineer. Based on the following brand information, create an EXCEPTIONAL and DETAILED prompt for generating a professional ${visualType}.

Brand Information:
${brandName ? `- Brand name: ${brandName}` : ''}
${slogan ? `- Slogan: ${slogan}` : ''}
${activity ? `- Domain/Activity: ${activity}` : ''}
${description ? `- Description: ${description}` : ''}
${categoryName ? `- Target format: ${categoryName}` : ''}

Create a prompt that includes:
1. Visual concept that reflects the brand identity
2. Professional style and aesthetic appropriate for ${visualType}
3. Sophisticated color palette
4. Modern design elements
5. Typography suggestions (if relevant for ${visualType})
6. Mood and atmosphere
7. Technical specifications for high-quality rendering

The prompt must be:
- Professional and creative
- Detailed and specific (3-5 sentences)
- Ready to use with image generation AI
- In ${language === 'fr' ? 'French' : 'English'}
- Optimized to create something UNIQUE and MEMORABLE
- Specifically tailored for creating a ${visualType}

Return ONLY the generated prompt, nothing else.`,
        response_json_schema: {
          type: "object",
          properties: {
            prompt: { type: "string" }
          }
        }
      });

      onPromptGenerated(result.prompt);
      handleReset();
      onClose();
    } catch (error) {
      console.error('Generation failed:', error);
      alert(language === 'fr' ? 'Erreur lors de la génération' : 'Generation error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setStep('choice');
    setUploadedImage(null);
    setImageUrl(null);
    setBrandName('');
    setSlogan('');
    setActivity('');
    setDescription('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-pink-500/30 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-400" />
            {language === 'fr' ? 'Prompt Creator' : 'Prompt Creator'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'choice' && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 py-4"
            >
              <p className="text-white/60 text-sm">
                {language === 'fr' 
                  ? 'Choisissez votre méthode de création de prompt :' 
                  : 'Choose your prompt creation method:'}
              </p>

              <button
                onClick={() => setStep('image')}
                className="w-full p-4 rounded-xl bg-gradient-to-br from-violet-600/20 to-purple-600/20 hover:from-violet-600/30 hover:to-purple-600/30 border border-violet-500/30 hover:border-violet-500/50 transition-all flex items-center gap-4"
              >
                <div className="p-3 rounded-lg bg-violet-600/30">
                  <Image className="h-6 w-6 text-violet-300" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white mb-1">
                    {language === 'fr' ? 'À partir d\'une image' : 'From an image'}
                  </h3>
                  <p className="text-xs text-white/60">
                    {language === 'fr' 
                      ? 'Uploadez une image et l\'IA analysera son style pour créer un prompt' 
                      : 'Upload an image and AI will analyze its style to create a prompt'}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setStep('info')}
                className="w-full p-4 rounded-xl bg-gradient-to-br from-pink-600/20 to-rose-600/20 hover:from-pink-600/30 hover:to-rose-600/30 border border-pink-500/30 hover:border-pink-500/50 transition-all flex items-center gap-4"
              >
                <div className="p-3 rounded-lg bg-pink-600/30">
                  <FileText className="h-6 w-6 text-pink-300" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white mb-1">
                    {language === 'fr' ? 'À partir d\'informations' : 'From information'}
                  </h3>
                  <p className="text-xs text-white/60">
                    {language === 'fr' 
                      ? 'Renseignez votre marque et l\'IA créera un prompt personnalisé' 
                      : 'Provide your brand info and AI will create a custom prompt'}
                  </p>
                </div>
              </button>
            </motion.div>
          )}

          {step === 'image' && (
            <motion.div
              key="image"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 py-4"
            >
              {!uploadedImage ? (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-violet-500/30 hover:border-violet-500/50 rounded-xl cursor-pointer bg-violet-500/5 hover:bg-violet-500/10 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-12 w-12 text-violet-400 mb-3" />
                    <p className="mb-2 text-sm text-white/60">
                      <span className="font-semibold">
                        {language === 'fr' ? 'Cliquez pour uploader' : 'Click to upload'}
                      </span>
                    </p>
                    <p className="text-xs text-white/40">
                      PNG, JPG, JPEG
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isGenerating}
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl border border-violet-500/30"
                  />
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setImageUrl(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-all"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setStep('choice')}
                  className="flex-1"
                  disabled={isGenerating}
                >
                  {language === 'fr' ? 'Retour' : 'Back'}
                </Button>
                <Button
                  onClick={handleGenerateFromImage}
                  disabled={!imageUrl || isGenerating}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {language === 'fr' ? 'Analyse...' : 'Analyzing...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {language === 'fr' ? 'Générer le prompt' : 'Generate prompt'}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 py-4"
            >
              <div>
                <label className="text-sm text-white/60 mb-2 block">
                  {language === 'fr' ? 'Nom de la marque (optionnel)' : 'Brand name (optional)'}
                </label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder={language === 'fr' ? 'Ex: TechFlow' : 'Ex: TechFlow'}
                  className="bg-white/5 border-pink-500/20 focus:border-pink-500/40 text-white"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">
                  {language === 'fr' ? 'Slogan (optionnel)' : 'Slogan (optional)'}
                </label>
                <Input
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder={language === 'fr' ? 'Ex: L\'innovation au service de tous' : 'Ex: Innovation for everyone'}
                  className="bg-white/5 border-pink-500/20 focus:border-pink-500/40 text-white"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">
                  {language === 'fr' ? 'Domaine d\'activité (optionnel)' : 'Activity domain (optional)'}
                </label>
                <Input
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder={language === 'fr' ? 'Ex: Technologie, Design, E-commerce...' : 'Ex: Technology, Design, E-commerce...'}
                  className="bg-white/5 border-pink-500/20 focus:border-pink-500/40 text-white"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">
                  {language === 'fr' ? 'Description *' : 'Description *'}
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'fr' ? 'Décrivez votre vision, vos valeurs, votre style souhaité...' : 'Describe your vision, values, desired style...'}
                  className="bg-white/5 border-pink-500/20 focus:border-pink-500/40 text-white min-h-[100px]"
                  disabled={isGenerating}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setStep('choice')}
                  className="flex-1"
                  disabled={isGenerating}
                >
                  {language === 'fr' ? 'Retour' : 'Back'}
                </Button>
                <Button
                  onClick={handleGenerateFromInfo}
                  disabled={isGenerating || !description.trim()}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {language === 'fr' ? 'Création...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {language === 'fr' ? 'Générer le prompt' : 'Generate prompt'}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}