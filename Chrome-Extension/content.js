function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

function findComposeToolbar() {
    const selectors = ['.aDh', '.btC', '[role="dialog"]', '.gU.Up'];
    for (const selector of selectors) {
        try {
            const toolbar = document.querySelector(selector);
            if (toolbar) {
                console.log(`Found toolbar with selector: ${selector}`);
                return toolbar;
            }
        } catch (error) {
            console.warn(`Error with selector ${selector}:`, error);
        }
    }
    return null;
}

function getEmailContent() {
    const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'];
    for (const selector of selectors) {
        try {
            const content = document.querySelector(selector);
            if (content && content.innerText) {
                return content.innerText.trim();
            }
        } catch (error) {
            console.warn(`Error getting email content with selector ${selector}:`, error);
        }
    }
    return "No email content found"; 
}

function injectButton() {
    try {
        const existingButton = document.querySelector('.ai-reply-button');
        if (existingButton) existingButton.remove();

        const existingDropdown = document.querySelector('.ai-tone-dropdown');
        if (existingDropdown) existingDropdown.remove();

        const toolbar = findComposeToolbar();
        if (!toolbar) return;

        
        const button = createAIButton();
        button.classList.add('ai-reply-button');

        
const toneDropdown = document.createElement('select');
toneDropdown.className = 'ai-tone-dropdown T-I J-J5-Ji aoO v7 T-I-atl L3';
toneDropdown.style.marginRight = '8px';
toneDropdown.style.backgroundColor = '#1A73E8';  
toneDropdown.style.color = 'white';
toneDropdown.style.border = 'none';
toneDropdown.style.borderRadius = '4px';
toneDropdown.style.cursor = 'pointer';
toneDropdown.style.height = '36px';
toneDropdown.style.padding = '0 12px';
toneDropdown.style.fontSize = '14px';
toneDropdown.style.fontFamily = '"Google Sans", Roboto, Arial, sans-serif';


toneDropdown.innerHTML = `
    <option value="Professional">Professional</option>
    <option value="Apologitic">Apologitic</option>
    <option value="Casual">Casual</option>
    <option value="Friendly">Friendly</option>
    <option value="Formal">Formal</option>
`;


        toneDropdown.innerHTML = `
            <option value="Professional">Professional</option>
            <option value="Apologitic">Apologitic</option>
            <option value="Casual">Casual</option>
            <option value="Friendly">Friendly</option>
            <option value="Formal">Formal</option>
        `;

        
        button.addEventListener('click', async () => {
            try {
                button.innerHTML = 'Generating...';
                button.style.pointerEvents = 'none';
                button.style.opacity = '0.6';

                const emailContent = getEmailContent();
                const selectedTone = toneDropdown.value; 

                const response = await fetch('http://localhost:8080/api/email/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        emailBody: emailContent,
                        emailTone: selectedTone   
                    })
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const generatedReply = await response.text();

                
                const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
                if (composeBox) {
                    composeBox.focus();
                    composeBox.innerHTML = generatedReply;
                    composeBox.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    alert("Could not find compose box. Open a compose window.");
                }

            } catch (error) {
                console.error("Error generating AI reply:", error);
                alert(`Failed to generate AI reply: ${error.message}`);
            } finally {
                button.innerHTML = 'AI Reply';
                button.style.pointerEvents = 'auto';
                button.style.opacity = '1';
            }
        });

        
        toolbar.insertBefore(toneDropdown, toolbar.firstChild);
        toolbar.insertBefore(button, toolbar.firstChild);

    } catch (error) {
        console.error("Error in injectButton:", error);
    }
}


function startObserving() {
   
    if (!document.body) {
        console.log("Document body not ready, retrying...");
        setTimeout(startObserving, 100);
        return;
    }
    
    const observer = new MutationObserver((mutations) => {
        try {
            let shouldInject = false;
            
            for (const mutation of mutations) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    const addedNodes = Array.from(mutation.addedNodes);
                    
                    const hasComposeElements = addedNodes.some(node => {
                        // ✅ SAFETY CHECK - only process Element nodes
                        if (!(node instanceof Element)) return false;
                        
                        try {
                            // Check if this element matches compose selectors
                            const directMatch = node.matches && node.matches('.aDh, .btC, [role="dialog"]');
                            
                            // Check if this element contains compose elements
                            const containsMatch = node.querySelector && node.querySelector('.aDh, .btC, [role="dialog"]');
                            
                            return directMatch || containsMatch;
                        } catch (methodError) {
                            console.warn("Error calling element methods:", methodError);
                            return false;
                        }
                    });
                    
                    if (hasComposeElements) {
                        shouldInject = true;
                        break;
                    }
                }
            }
            
            if (shouldInject) {
                console.log("Compose window detected. Injecting button...");
                
                setTimeout(injectButton, 200);
            }
            
        } catch (observerError) {
            console.error("Error in MutationObserver:", observerError);
        }
    });
    
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log("MutationObserver started successfully");
    return observer;
}


function initializeExtension() {
    console.log("Gmail AI Reply Extension: Starting initialization...");
    
    
    setTimeout(() => {
        console.log("Checking for existing compose windows...");
        injectButton();
    }, 1000);
    
    
    startObserving();
    
    console.log("Gmail AI Reply Extension: Initialization complete");
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    
    initializeExtension();
}