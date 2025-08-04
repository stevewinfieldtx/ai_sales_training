class MyOnlineStories {
    constructor() {
        this.kimiApiKey = '';
        this.runwareApiKey = '';
        this.currentStory = null;
        this.isGenerating = false;
        
        this.init();
    }

    async init() {
        await this.loadApiKeys();
        this.bindEvents();
        this.setupFormValidation();
    }

    async loadApiKeys() {
        try {
            const response = await fetch('/api/config');
            const config = await response.json();
            this.kimiApiKey = config.kimiApiKey;
            this.runwareApiKey = config.runwareApiKey;
            
            // Hide API key fields if they're set via environment variables
            if (this.kimiApiKey || this.runwareApiKey) {
                this.hideApiSection();
            }
        } catch (error) {
            console.warn('Failed to load API keys from environment:', error);
        }
    }

    hideApiSection() {
        const apiSection = document.querySelector('.api-section');
        if (apiSection) {
            apiSection.style.display = 'none';
        }
    }

    bindEvents() {
        const form = document.getElementById('story-form');
        const createAnotherBtn = document.getElementById('create-another-btn');
        const downloadBtn = document.getElementById('download-story-btn');

        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        createAnotherBtn.addEventListener('click', () => this.resetForm());
        downloadBtn.addEventListener('click', () => this.downloadStory());
    }

    setupFormValidation() {
        const inputs = document.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isValid = value !== '';
        
        if (!isValid) {
            this.showFieldError(field, 'This field is required');
        } else {
            this.clearFieldError(field);
        }
        
        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (this.isGenerating) return;
        
        if (!this.validateForm()) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const formData = new FormData(e.target);
        
        // Only get API keys from form if not already loaded from environment
        if (!this.kimiApiKey) {
            this.kimiApiKey = formData.get('kimi-api-key');
        }
        if (!this.runwareApiKey) {
            this.runwareApiKey = formData.get('runware-api-key');
        }
        
        const storyData = {
            characterName: formData.get('character-name'),
            ageRange: formData.get('age-range'),
            genre: formData.get('story-genre'),
            setting: formData.get('story-setting'),
            specialPower: formData.get('special-power'),
            characterPhoto: formData.get('character-photo')
        };
        
        await this.generateStory(storyData);
    }

    validateForm() {
        const requiredFields = document.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    async generateStory(storyData) {
        this.isGenerating = true;
        this.showLoadingSection();
        
        try {
            // Step 1: Generate story text
            this.updateLoadingProgress(20, 'Generating your personalized story...');
            const story = await this.createAIStory(storyData);
            
            if (!story) {
                throw new Error('Failed to generate story');
            }
            
            // Step 2: Generate artwork
            this.updateLoadingProgress(60, 'Creating magical artwork...');
            const artwork = await this.generateArtwork(story, storyData);
            
            // Step 3: Display results
            this.updateLoadingProgress(100, 'Finalizing your story...');
            
            setTimeout(() => {
                this.displayStory(story, artwork);
                this.isGenerating = false;
            }, 1000);
            
        } catch (error) {
            console.error('Story generation error:', error);
            this.showNotification('Failed to generate story. Please try again.', 'error');
            this.hideLoadingSection();
            this.isGenerating = false;
        }
    }

    async createAIStory(storyData) {
        if (!this.kimiApiKey) {
            console.warn('No Kimi AI API key provided, using template story');
            return this.createTemplateStory(storyData);
        }
        
        try {
            const story = await this.callKimiAPI(storyData);
            return story || this.createTemplateStory(storyData);
        } catch (error) {
            console.warn('Kimi AI API failed, falling back to template:', error);
            return this.createTemplateStory(storyData);
        }
    }

    async callKimiAPI(storyData) {
        const prompt = `Create a personalized children's story with the following details:
        
        Character: ${storyData.characterName}
        Age Range: ${storyData.ageRange}
        Genre: ${storyData.genre}
        Setting: ${storyData.setting}
        Special Power: ${storyData.specialPower}
        
        Please write a engaging, age-appropriate story that is approximately 300-500 words long. The story should:
        - Feature ${storyData.characterName} as the main character
        - Be set in a ${storyData.setting}
        - Include the special power of ${storyData.specialPower}
        - Follow the ${storyData.genre} genre
        - Have a positive, uplifting message
        - Be suitable for ${storyData.ageRange} readers
        - Include dialogue and descriptive scenes
        - Have a satisfying conclusion
        
        Format the response as a complete story with a title.`;

        const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.kimiApiKey}`
            },
            body: JSON.stringify({
                model: 'moonshot-v1-8k',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`Kimi AI API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            title: `${storyData.characterName}'s ${storyData.genre} Adventure`,
            content: data.choices[0].message.content,
            ...storyData
        };
    }

    createTemplateStory(storyData) {
        const templates = {
            fantasy: {
                title: `${storyData.characterName} and the Magical Quest`,
                content: `Once upon a time, in a ${storyData.setting}, there lived a brave ${storyData.ageRange} named ${storyData.characterName}. ${storyData.characterName} had always been different from others, possessing the incredible power of ${storyData.specialPower}.\n\nOne sunny morning, ${storyData.characterName} discovered that the magical crystals that kept their world in balance were disappearing. Using their gift of ${storyData.specialPower}, ${storyData.characterName} embarked on an epic adventure to save their home.\n\nThrough courage, kindness, and the help of new friends, ${storyData.characterName} learned that true magic comes from believing in yourself and helping others. In the end, they not only saved their world but also discovered that their greatest power was their caring heart.`
            },
            adventure: {
                title: `${storyData.characterName}'s Great Adventure`,
                content: `${storyData.characterName} was an ordinary ${storyData.ageRange} living in a ${storyData.setting}, until the day they discovered their amazing ability of ${storyData.specialPower}.\n\nWhen their community faced a great challenge, ${storyData.characterName} knew they had to help. With determination and their special gift, they set out on an incredible journey filled with excitement and discovery.\n\nAlong the way, ${storyData.characterName} met wonderful friends, overcame obstacles, and learned valuable lessons about friendship, courage, and perseverance. Their adventure proved that anyone can be a hero when they believe in themselves.`
            }
        };
        
        const template = templates[storyData.genre] || templates.fantasy;
        return {
            title: template.title,
            content: template.content,
            ...storyData
        };
    }

    async generateArtwork(story, storyData) {
        if (!this.runwareApiKey) {
            console.warn('No Runware API key provided, using placeholder artwork');
            return this.createPlaceholderArtwork(storyData);
        }
        
        try {
            const artworkPrompt = await this.createAIArtworkPrompt(story, storyData);
            const artwork = await this.callRunwareAPI(artworkPrompt);
            return artwork || this.createPlaceholderArtwork(storyData);
        } catch (error) {
            console.warn('Runware API failed, using placeholder:', error);
            return this.createPlaceholderArtwork(storyData);
        }
    }

    async createAIArtworkPrompt(story, storyData) {
        if (!this.kimiApiKey) {
            return this.createArtworkPrompt(storyData);
        }
        
        try {
            const prompt = `Based on this story about ${storyData.characterName}, create a detailed art prompt for generating an illustration:
            
            Story: ${story.content}
            
            Character: ${storyData.characterName}
            Genre: ${storyData.genre}
            Setting: ${storyData.setting}
            Special Power: ${storyData.specialPower}
            
            Create a detailed art prompt that describes:
            - Character appearance and clothing
            - Setting and environment details
            - Key visual elements from the story
            - Art style (child-friendly, colorful, whimsical)
            - Mood and atmosphere
            
            Keep it under 200 words and focus on visual details.`;

            const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.kimiApiKey}`
                },
                body: JSON.stringify({
                    model: 'moonshot-v1-8k',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    max_tokens: 300,
                    temperature: 0.8
                })
            });

            if (!response.ok) {
                throw new Error(`Kimi AI API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.warn('AI artwork prompt generation failed:', error);
            return this.createArtworkPrompt(storyData);
        }
    }

    createArtworkPrompt(storyData) {
        const settingDescriptions = {
            'magical-forest': 'enchanted forest with glowing trees, fairy lights, and mystical creatures',
            'space-station': 'futuristic space station with stars, planets, and advanced technology',
            'underwater-city': 'beautiful underwater city with coral, sea creatures, and bubble architecture',
            'mountain-village': 'cozy mountain village with snow-capped peaks and wooden houses',
            'desert-oasis': 'magical desert oasis with palm trees, clear water, and golden sand dunes',
            'cloud-kingdom': 'floating kingdom in the clouds with rainbow bridges and sky castles',
            'modern-city': 'vibrant modern city with skyscrapers, parks, and bustling streets'
        };
        
        const powerDescriptions = {
            'invisibility': 'character with a subtle shimmer effect, partially transparent',
            'flying': 'character soaring through the air with arms outstretched',
            'telepathy': 'character with glowing eyes and thought bubbles around them',
            'time-travel': 'character surrounded by swirling time portals and clock imagery',
            'shape-shifting': 'character mid-transformation with magical sparkles',
            'elemental': 'character controlling elements with glowing hands and energy effects',
            'healing': 'character with warm, golden light emanating from their hands'
        };
        
        const setting = settingDescriptions[storyData.setting] || 'magical fantasy landscape';
        const power = powerDescriptions[storyData.specialPower] || 'character with magical abilities';
        
        return `A ${storyData.characterName} as a ${storyData.ageRange} in a ${setting}. The ${power}. Colorful, whimsical, child-friendly illustration with warm lighting and magical atmosphere. Children's book illustration style, colorful, friendly, safe for kids.`;
    }

    async callRunwareAPI(prompt) {
        // Placeholder for Runware API integration
        // In a real implementation, you would call the Runware API here
        console.log('Runware API prompt:', prompt);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Return placeholder artwork URL
        return {
            url: `https://via.placeholder.com/400x400/667eea/ffffff?text=${encodeURIComponent('Generated Artwork')}`,
            prompt: prompt
        };
    }

    createPlaceholderArtwork(storyData) {
        return {
            url: `https://via.placeholder.com/400x400/667eea/ffffff?text=${encodeURIComponent(storyData.characterName + "'s Adventure")}`,
            prompt: `Artwork for ${storyData.characterName}'s ${storyData.genre} story`
        };
    }

    showLoadingSection() {
        document.getElementById('story-form').style.display = 'none';
        document.getElementById('loading-section').style.display = 'block';
        document.getElementById('story-section').style.display = 'none';
        
        this.updateLoadingProgress(0, 'Preparing to create your story...');
    }

    hideLoadingSection() {
        document.getElementById('loading-section').style.display = 'none';
        document.getElementById('story-form').style.display = 'block';
    }

    updateLoadingProgress(percentage, message) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const loadingDescription = document.getElementById('loading-description');
        
        progressFill.style.width = percentage + '%';
        progressText.textContent = percentage + '%';
        loadingDescription.textContent = message;
    }

    displayStory(story, artwork) {
        document.getElementById('loading-section').style.display = 'none';
        document.getElementById('story-section').style.display = 'block';
        
        // Set story title
        document.getElementById('story-title').textContent = story.title;
        
        // Set artwork
        const artworkContainer = document.getElementById('story-artwork');
        artworkContainer.innerHTML = `
            <img src="${artwork.url}" alt="Story illustration" />
            <p><small>Generated artwork for your story</small></p>
        `;
        
        // Set story text
        const storyTextContainer = document.getElementById('story-text');
        const formattedContent = story.content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
        storyTextContainer.innerHTML = `
            <h3>Your Personalized Story</h3>
            <p>${formattedContent}</p>
        `;
        
        // Store current story for download
        this.currentStory = { story, artwork };
        
        // Add animation
        document.getElementById('story-section').classList.add('fade-in');
        
        // Scroll to story
        document.getElementById('story-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    resetForm() {
        document.getElementById('story-form').reset();
        document.getElementById('story-form').style.display = 'block';
        document.getElementById('story-section').style.display = 'none';
        document.getElementById('loading-section').style.display = 'none';
        
        // Clear any error states
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(el => {
            el.remove();
        });
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    downloadStory() {
        if (!this.currentStory) return;
        
        const { story, artwork } = this.currentStory;
        
        // Create downloadable content
        const content = `
${story.title}

${story.content}

---
Generated by MyOnlineStories
Powered by Kimi AI & Runware AI
        `.trim();
        
        // Create and download file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Story downloaded successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px'
        });
        
        // Set background color based on type
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#667eea',
            warning: '#f39c12'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MyOnlineStories();
});