# prompt-engineering
prompt-engineering

# The Project is to build Prompts Library 

## Prompt Library App (Live Server)

This repo includes a small **Prompt Library** web app (HTML/CSS/JS) that lets you:
- **Create** prompts (title + content)
- **Save** them to **LocalStorage**
- **View** all saved prompts
- **Delete** prompts you don’t need anymore
- **Toggle Light/Dark mode** (remembers your choice)

### How to run (VS Code Live Server)

- Open this folder in VS Code
- Right-click `index.html` → **Open with Live Server**
  - Or click **Go Live**

Your prompts are stored **locally in your browser** (LocalStorage) on this device.

### Files

- `index.html`: UI
- `styles.css`: light-mode styling
- `script.js`: app logic (LocalStorage save/list/delete, search/sort, export/import, light/dark theme)



## What is Prompt Engineering ?

Prompt Engineering is the practice of designing and refining input prompts (instructions or queries) to effectively communicate with Large Language Models (LLMs) and other AI systems. It involves crafting clear, specific, and well-structured prompts to achieve desired outputs from AI models.

Key aspects of prompt engineering include:
- **Clarity and Specificity**: Writing prompts that clearly convey the task or question
- **Context Provision**: Providing relevant background information and examples
- **Output Formatting**: Specifying the desired format, structure, or style of the response
- **Iterative Refinement**: Testing and improving prompts based on model responses
- **Technique Application**: Using various techniques like few-shot learning, chain-of-thought prompting, role-playing, and structured output formatting

Effective prompt engineering can significantly improve the quality, accuracy, and relevance of AI-generated responses, making it a crucial skill for working with modern AI systems.


## What is LLM ?

LLM stands for **Large Language Model**. It is a type of artificial intelligence model that has been trained on vast amounts of text data to understand and generate human-like text.

Key characteristics of LLMs:

- Patterns Predictors that generate one token at a time 
- Token by Token Generation means no planning ahead
- works like auto complete 
- LLMs are non-deterministic
- LLMs only "think" while they are typing
- LLMs are non-deterministic
- LLMs does not have memory
- Same prompts can give a different answers
- Ask you LLMs about it's cut off date


- **Scale**: Trained on billions or trillions of parameters and massive text datasets
- **Capabilities**: Can perform various language tasks including text generation, translation, summarization, question answering, and code generation
- **Architecture**: Typically based on transformer neural network architectures
- **Examples**: GPT (Generative Pre-trained Transformer), Claude, LLaMA, PaLM, and others
- **Applications**: Used in chatbots, content creation, code assistance, research, and many other domains

LLMs learn patterns, relationships, and knowledge from their training data, allowing them to generate coherent and contextually relevant text based on the prompts they receive.


## Temperature and Top P

- Temperature control randomness
    - 0 = deterministic , 2 = chaotic
    - Lower is better for factual tasks, code, data extraction
    - Higher is better for creative writing, brainstorming, varied solutions

- Top P ( 0 -> 1 )
    - Alternative to temperature ( can utilize it with temperature )
    - Cumulative probability cutoff ( give the most probable answer )

- you can control temperature from API of the LLM 


## Tokens Limits and Context Windows 

 - Tokens are roughly 0.75 words, but not always 
 - Cumulative tokens = input + output history
 - Context Windows is The Maximum tokens the model can "remember"
 - When you hits limits, oldest context drops off silently 


## System Message
 - The invisible "Personality" beh==ind every AI interaction
 - Set by the provider ( OpenAI, Cursor , ... etc. )
 - Takes up part of your context window
 - Why the same model acts differently in different tools 

## Standard Prompt
 - your direct question or instruction to the AI
 - The simplest form of prompting " just ask "
 - The foundation that everything else builds on 
 - Quality of question directly relates to the quality of answer

 
 ## Zero shot Prompt 
 - Direct task request without any examples 
 - Model relies entirely on pre-training knowledge
 - Works well for common tasks
 - Quality Varies based on task complexity 

 ## One Shot Prompt 
 - Provide exactly one example with your request
 - Model learns the pattern, format, and the style from the example 
 - Useful for establishing the format 
 - Show don't tell