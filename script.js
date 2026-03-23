document.addEventListener('DOMContentLoaded', () => {
    console.log("The Hallmark by Kanakia - Website Loaded");
    const apiBases = window.location.port === '3000'
        ? ['']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'];

    // Sticky Navbar
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    const mapToggle = document.getElementById('map-toggle');
    const layoutMap = document.getElementById('layout-map');
    const googleMap = document.getElementById('google-map');

    if (mapToggle) {
        mapToggle.addEventListener('change', () => {
            if (mapToggle.checked) {
                layoutMap.classList.remove('active');
                googleMap.classList.add('active');
            } else {
                layoutMap.classList.add('active');
                googleMap.classList.remove('active');
            }
        });
    }

    // Accordion Logic - Direct style manipulation for guaranteed reliability
    const accordionItems = document.querySelectorAll('.accordion-item');

    function closeAll() {
        accordionItems.forEach(item => {
            const content = item.querySelector('.accordion-content');
            const chevron = item.querySelector('.chevron');
            if (content) content.style.maxHeight = null;
            if (chevron) chevron.style.transform = '';
            item.classList.remove('active');
        });
    }

    function openItem(item) {
        const content = item.querySelector('.accordion-content');
        const chevron = item.querySelector('.chevron');
        item.classList.add('active');
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
        if (chevron) chevron.style.transform = 'rotate(180deg)';
    }

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        if (!header) return;

        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            closeAll();
            if (!isActive) {
                openItem(item);
            }
        });
    });

    // Open the first accordion item by default
    if (accordionItems.length > 0) {
        openItem(accordionItems[0]);
    }

    // ===== AMENITIES SLIDESHOW =====
    const amenitySlides = document.querySelectorAll('.amenities-slideshow .slide');
    const dots = document.querySelectorAll('.slide-dots .dot');
    const prevBtn = document.getElementById('amenity-prev');
    const nextBtn = document.getElementById('amenity-next');
    const slideCurrentEl = document.getElementById('slide-current');
    const thumbImgTop = document.getElementById('thumb-img-top');
    const thumbImgBottom = document.getElementById('thumb-img-bottom');
    let currentSlide = 0;
    let slideInterval;

    // Image URLs for all 5 slides
    const slideImages = [
        'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1551882547-ff40c4a49d64?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&q=80&w=800'
    ];

    function goToSlide(index) {
        amenitySlides[currentSlide]?.classList.remove('active');
        dots[currentSlide]?.classList.remove('active');

        currentSlide = (index + amenitySlides.length) % amenitySlides.length;
        const nextIndex = (currentSlide + 1) % amenitySlides.length;

        amenitySlides[currentSlide]?.classList.add('active');
        dots[currentSlide]?.classList.add('active');

        // Sync arch thumbnails
        if (thumbImgBottom) thumbImgBottom.src = slideImages[currentSlide];
        if (thumbImgTop) thumbImgTop.src = slideImages[nextIndex];

        // Update counter
        if (slideCurrentEl) {
            slideCurrentEl.textContent = String(currentSlide + 1).padStart(2, '0');
        }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); resetInterval(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); resetInterval(); });

    dots.forEach(dot => {
        dot.addEventListener('click', () => { goToSlide(parseInt(dot.dataset.slide)); resetInterval(); });
    });

    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
    }
    // Auto-play
    slideInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);

    // ===== SPECIFICATIONS SLIDER =====
    const specificationsSection = document.querySelector('.specifications-section');
    const specImgSmall = document.getElementById('spec-img-small');
    const specImgTall = document.getElementById('spec-img-tall');
    const specImgMain = document.getElementById('spec-img-main');
    const specKicker = document.getElementById('spec-kicker');
    const specTitle = document.getElementById('spec-title');
    const specDescription = document.getElementById('spec-description');
    const specCategory = document.getElementById('spec-category');
    const specList = document.getElementById('spec-list');
    const specCurrent = document.getElementById('spec-current');
    const specTotal = document.getElementById('spec-total');
    const specPrev = document.getElementById('spec-prev');
    const specNext = document.getElementById('spec-next');

    const specificationSlides = [
        {
            kicker: 'Built To Endure,',
            title: 'Designed To Impress',
            description: 'Every material and finish is chosen for durability, aesthetics, and comfort, ensuring long-lasting value while preserving a refined, elevated look through every space.',
            category: '1. Doors & Windows',
            images: {
                small: {
                    src: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=900',
                    alt: 'Smart door lock detail'
                },
                tall: {
                    src: 'https://images.unsplash.com/photo-1556909114-44e3e9699e2b?auto=format&fit=crop&q=80&w=1200',
                    alt: 'Kitchen finishes and cabinetry'
                },
                main: {
                    src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1400',
                    alt: 'Premium wooden door and foyer detail'
                }
            },
            bullets: [
                'Main & bedroom door: both sides laminated post-formed flush door shutter.',
                'Toilet & bathroom door: wooden-finish FRP door with quality fittings.',
                'Windows and French doors: sliding aluminium system with clear glass panels.',
                'Bathroom window louvers and shutters: UPVC for durability and easy maintenance.'
            ]
        },
        {
            kicker: 'Surfaces That',
            title: 'Stay Beautiful',
            description: 'Thoughtfully selected finishes balance resilience with visual warmth, helping every room feel polished, easy to maintain, and timeless over the years.',
            category: '2. Flooring & Wall Finish',
            images: {
                small: {
                    src: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=900',
                    alt: 'Wall finish and storage detail'
                },
                tall: {
                    src: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&q=80&w=1200',
                    alt: 'Elegant flooring and dining area'
                },
                main: {
                    src: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1400',
                    alt: 'Textured wall with warm wood detailing'
                }
            },
            bullets: [
                'Living, dining, kitchen, and bedroom flooring finished with premium vitrified tiles.',
                'Toilet and balcony floors use anti-skid tiles for added safety.',
                'Dado in toilets planned with designer wall finishes up to door height.',
                'Internal walls receive smooth gypsum finish with quality acrylic paint.'
            ]
        },
        {
            kicker: 'A Kitchen',
            title: 'Made To Perform',
            description: 'Daily functionality is paired with refined detailing so the kitchen remains efficient, elegant, and ready for the rhythm of modern family life.',
            category: '3. Kitchen & Utility',
            images: {
                small: {
                    src: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=900',
                    alt: 'Utility and fixture corner detail'
                },
                tall: {
                    src: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1200',
                    alt: 'Modular kitchen cabinetry and counter'
                },
                main: {
                    src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=1400',
                    alt: 'Contemporary kitchen with warm lighting'
                }
            },
            bullets: [
                'Granite kitchen platform with stainless steel sink and drain board.',
                'Provision for water purifier, refrigerator, washing machine, and exhaust fan.',
                'Designer wall dado above kitchen counter for easy upkeep.',
                'Dedicated utility zone planned for practical day-to-day use.'
            ]
        },
        {
            kicker: 'Bathrooms With',
            title: 'Hotel-Style Ease',
            description: 'Comfort-driven planning and durable fittings bring together convenience, clean detailing, and a polished luxury feel for everyday use.',
            category: '4. Bathrooms & Fittings',
            images: {
                small: {
                    src: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=900',
                    alt: 'Bathroom fittings detail'
                },
                tall: {
                    src: 'https://images.unsplash.com/photo-1629079447777-1e605162dc8d?auto=format&fit=crop&q=80&w=1200',
                    alt: 'Refined bathroom stone finish'
                },
                main: {
                    src: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=1400',
                    alt: 'Luxury bathroom interior'
                }
            },
            bullets: [
                'Premium CP fittings and branded sanitary ware for long-term performance.',
                'Concealed plumbing layout planned for a clean visual finish.',
                'Hot and cold mixer provision included in shower area.',
                'Exhaust fan and geyser points considered in bathroom planning.'
            ]
        },
        {
            kicker: 'Light, Air, And',
            title: 'Better Living',
            description: 'Well-planned openings and smart utility provisions make every residence feel brighter, healthier, and more adaptable to modern routines.',
            category: '5. Electrical & Comfort',
            images: {
                small: {
                    src: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=900',
                    alt: 'Modern switch panel detail'
                },
                tall: {
                    src: 'https://images.unsplash.com/photo-1617098474202-0d0d7f60f9e1?auto=format&fit=crop&q=80&w=1200',
                    alt: 'Bright interior with natural light'
                },
                main: {
                    src: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1400',
                    alt: 'Sunlit dining and living area'
                }
            },
            bullets: [
                'Concealed copper wiring with modular switches across the residence.',
                'TV, data, and AC points planned in key living and bedroom areas.',
                'Generator backup for essential common and safety systems.',
                'Cross-ventilation and generous openings improve natural light and comfort.'
            ]
        },
        {
            kicker: 'Every Detail',
            title: 'Future-Ready',
            description: 'From safety-focused planning to dependable utility infrastructure, the specifications are curated to support long-term ease and peace of mind.',
            category: '6. Safety & Essentials',
            images: {
                small: {
                    src: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=900',
                    alt: 'Entry and access detail'
                },
                tall: {
                    src: 'https://images.unsplash.com/photo-1600047509782-20d39509f26d?auto=format&fit=crop&q=80&w=1200',
                    alt: 'Lobby and security-ready circulation space'
                },
                main: {
                    src: 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&q=80&w=1400',
                    alt: 'Warm entrance lobby with secure detailing'
                }
            },
            bullets: [
                'Video door phone and security provisions planned for added peace of mind.',
                'Fire-safety systems designed in line with statutory norms for common areas.',
                'Power backup for lifts, pumps, and key common infrastructure.',
                'Reliable water storage and distribution system for uninterrupted convenience.'
            ]
        }
    ];

    if (specificationsSection && specImgSmall && specImgTall && specImgMain) {
        let specificationIndex = 0;
        let specificationInterval;

        const renderSpecificationSlide = (index) => {
            const slide = specificationSlides[index];

            specImgSmall.src = slide.images.small.src;
            specImgSmall.alt = slide.images.small.alt;
            specImgTall.src = slide.images.tall.src;
            specImgTall.alt = slide.images.tall.alt;
            specImgMain.src = slide.images.main.src;
            specImgMain.alt = slide.images.main.alt;

            if (specKicker) specKicker.textContent = slide.kicker;
            if (specTitle) specTitle.textContent = slide.title;
            if (specDescription) specDescription.textContent = slide.description;
            if (specCategory) specCategory.textContent = slide.category;
            if (specCurrent) specCurrent.textContent = String(index + 1).padStart(2, '0');
            if (specTotal) specTotal.textContent = String(specificationSlides.length).padStart(2, '0');

            if (specList) {
                specList.innerHTML = slide.bullets.map((item) => `<li>${item}</li>`).join('');
            }
        };

        const goToSpecificationSlide = (index) => {
            specificationIndex = (index + specificationSlides.length) % specificationSlides.length;
            specificationsSection.classList.add('is-sliding');

            window.setTimeout(() => {
                renderSpecificationSlide(specificationIndex);
            }, 220);

            window.setTimeout(() => {
                specificationsSection.classList.remove('is-sliding');
            }, 520);
        };

        const resetSpecificationInterval = () => {
            window.clearInterval(specificationInterval);
            specificationInterval = window.setInterval(() => {
                goToSpecificationSlide(specificationIndex + 1);
            }, 5500);
        };

        specPrev?.addEventListener('click', () => {
            goToSpecificationSlide(specificationIndex - 1);
            resetSpecificationInterval();
        });

        specNext?.addEventListener('click', () => {
            goToSpecificationSlide(specificationIndex + 1);
            resetSpecificationInterval();
        });

        renderSpecificationSlide(specificationIndex);
        resetSpecificationInterval();
    }

    // ===== ENQUIRY MODAL =====
    const enquireTrigger = document.querySelector('.enquire-now');
    const enquiryModal = document.getElementById('enquiry-modal');
    const enquiryClose = document.getElementById('enquiry-close');
    const enquiryForm = document.querySelector('.enquiry-form');
    const enquiryInputs = enquiryModal ? enquiryModal.querySelectorAll('input') : [];
    const enquiryMessage = document.getElementById('enquiry-message');
    const enquirySubmit = document.getElementById('enquiry-submit');

    const postEnquiry = async (payload) => {
        let lastError = null;

        for (const base of apiBases) {
            const endpoint = `${base}/api/enquiries`;
            try {
                return await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error('Unable to reach enquiry API.');
    };

    const setEnquiryMessage = (message, type = '') => {
        if (!enquiryMessage) return;
        enquiryMessage.textContent = message;
        enquiryMessage.classList.remove('is-success', 'is-error');
        if (type) {
            enquiryMessage.classList.add(type);
        }
    };

    const openEnquiryModal = () => {
        if (!enquiryModal) return;
        enquiryModal.classList.add('is-open');
        enquiryModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        setEnquiryMessage('');
        enquiryInputs[0]?.focus();
    };

    const closeEnquiryModal = () => {
        if (!enquiryModal) return;
        enquiryModal.classList.remove('is-open');
        enquiryModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    };

    enquireTrigger?.addEventListener('click', openEnquiryModal);
    enquireTrigger?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openEnquiryModal();
        }
    });

    enquiryClose?.addEventListener('click', closeEnquiryModal);

    enquiryModal?.addEventListener('click', (event) => {
        if (event.target instanceof HTMLElement && event.target.dataset.closeModal === 'true') {
            closeEnquiryModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && enquiryModal?.classList.contains('is-open')) {
            closeEnquiryModal();
        }
    });

    enquiryForm?.addEventListener('submit', async (event) => {
        event.preventDefault();

        const fullName = enquiryForm.elements.namedItem('full_name')?.value?.trim() || '';
        const phone = enquiryForm.elements.namedItem('phone')?.value?.trim() || '';
        const email = enquiryForm.elements.namedItem('email')?.value?.trim() || '';

        if (!fullName || !phone || !email) {
            setEnquiryMessage('Please fill in all required fields.', 'is-error');
            return;
        }

        if (enquirySubmit) {
            enquirySubmit.disabled = true;
            enquirySubmit.textContent = 'Submitting...';
        }
        setEnquiryMessage('Saving your enquiry...');

        try {
            const response = await postEnquiry({
                fullName,
                phone,
                email
            });

            const rawBody = await response.text();
            let result = null;
            if (rawBody) {
                try {
                    result = JSON.parse(rawBody);
                } catch (parseError) {
                    result = null;
                }
            }

            if (!response.ok) {
                throw new Error(result?.message || `Unable to submit enquiry (HTTP ${response.status}).`);
            }

            if (!result?.ok) {
                throw new Error(result?.message || 'Unable to submit enquiry.');
            }

            setEnquiryMessage('Enquiry submitted successfully.', 'is-success');
            enquiryForm.reset();

            window.setTimeout(() => {
                closeEnquiryModal();
            }, 900);
        } catch (error) {
            const networkError = error instanceof TypeError || String(error?.message || '').toLowerCase().includes('failed to fetch');
            if (networkError) {
                setEnquiryMessage('Cannot reach API server. Start server.js on port 3000 and try again.', 'is-error');
            } else {
                setEnquiryMessage(error.message || 'Something went wrong. Please try again.', 'is-error');
            }
        } finally {
            if (enquirySubmit) {
                enquirySubmit.disabled = false;
                enquirySubmit.textContent = 'Submit';
            }
        }
    });

    // ===== SCROLL REVEALS =====
    const revealGroups = [
        { selector: '.overview-image-container', effect: 'reveal-zoom' },
        { selector: '.overview-content', effect: 'reveal-up' },
        { selector: '.feature-item', effect: 'reveal-up', stagger: 90 },
        { selector: '.appreciation-left', effect: 'reveal-left' },
        { selector: '.appreciation-right', effect: 'reveal-right' },
        { selector: '.conn-feature', effect: 'reveal-up', stagger: 80 },
        { selector: '.map-controls-left, .map-sidebar', effect: 'reveal-right' },
        { selector: '.amenities-slideshow', effect: 'reveal-left' },
        { selector: '.amenities-content', effect: 'reveal-right' },
        { selector: '.gallery-header', effect: 'reveal-up' },
        { selector: '.gallery-card', effect: 'reveal-zoom', stagger: 70 },
        { selector: '.residences-media', effect: 'reveal-left' },
        { selector: '.residences-content', effect: 'reveal-right' },
        { selector: '.residence-point', effect: 'reveal-up', stagger: 90 },
        { selector: '.floorplan-shell', effect: 'reveal-up' },
        { selector: '.specifications-media', effect: 'reveal-left' },
        { selector: '.specifications-content', effect: 'reveal-right' },
        { selector: '.developer-brand, .developer-copy', effect: 'reveal-up' },
        { selector: '.developer-stat', effect: 'reveal-up', stagger: 100 },
        { selector: '.footer-shell', effect: 'reveal-up' }
    ];

    revealGroups.forEach(({ selector, effect, stagger = 0 }) => {
        document.querySelectorAll(selector).forEach((element, index) => {
            element.classList.add(effect);
            if (stagger) {
                element.style.setProperty('--reveal-delay', `${index * stagger}ms`);
            }
        });
    });

    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-zoom');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.16,
            rootMargin: '0px 0px -10% 0px'
        });

        revealElements.forEach((element) => revealObserver.observe(element));
    } else {
        revealElements.forEach((element) => element.classList.add('is-visible'));
    }

    // Smooth Scrolling for Internal Links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (event) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            const targetElement = document.querySelector(href);
            if (!targetElement) return;

            event.preventDefault();

            const headerOffset = header ? header.offsetHeight : 80;
            const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - headerOffset;

            window.scrollTo({
                top: targetTop,
                behavior: 'smooth'
            });
        });
    });
});
