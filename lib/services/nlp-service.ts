// Natural Language Processing service for the voice assistant

type Intent = {
  name: string
  confidence: number
  entities: Record<string, any>
}

type NLPResult = {
  intent: Intent
  entities: Record<string, any>
  sentiment: number // -1 to 1 (negative to positive)
  context?: Record<string, any>
}

// Intent patterns for matching
const intentPatterns = [
  {
    intent: "navigation.home",
    patterns: ["home", "go home", "take me home", "main page", "landing page", "start page"],
  },
  {
    intent: "navigation.movies",
    patterns: ["movies", "show movies", "film", "films", "movie page", "all movies", "browse movies"],
  },
  {
    intent: "navigation.shows",
    patterns: ["shows", "tv shows", "series", "tv series", "television", "show series", "browse shows"],
  },
  {
    intent: "navigation.mylist",
    patterns: ["my list", "watchlist", "saved", "favorites", "my movies", "my shows", "saved content"],
  },
  {
    intent: "navigation.profile",
    patterns: ["profile", "my profile", "account", "my account", "settings", "preferences"],
  },
  {
    intent: "search",
    patterns: ["search", "find", "look for", "search for", "find me", "look up", "query"],
  },
  {
    intent: "playback.play",
    patterns: ["play", "watch", "start", "stream", "view", "show me", "begin"],
  },
  {
    intent: "playback.resume",
    patterns: ["resume", "continue", "continue watching", "pick up", "where i left off", "unfinished"],
  },
  {
    intent: "recommendation",
    patterns: ["recommend", "suggestion", "what should i watch", "suggest", "recommend me", "good movie", "good show"],
  },
  {
    intent: "help",
    patterns: ["help", "what can you do", "commands", "how to use", "instructions", "guide me", "assist me"],
  },
]

// Entity extraction patterns
const entityPatterns = {
  genre: [
    "action",
    "adventure",
    "animation",
    "comedy",
    "crime",
    "documentary",
    "drama",
    "family",
    "fantasy",
    "history",
    "horror",
    "music",
    "mystery",
    "romance",
    "science fiction",
    "sci-fi",
    "thriller",
    "war",
    "western",
  ],
  time_period: ["new", "latest", "recent", "old", "classic", "90s", "80s", "70s", "2000s", "2010s", "2020s"],
  rating: ["top", "best", "highest rated", "popular", "trending", "acclaimed"],
  language: ["english", "spanish", "french", "german", "japanese", "korean", "chinese"],
  content_type: ["movie", "show", "series", "documentary", "film", "tv show"],
}

// Context management
let conversationContext: Record<string, any> = {}

/**
 * Process natural language input and extract intent, entities, and sentiment
 */
export function processNaturalLanguage(input: string): NLPResult {
  const normalizedInput = input.toLowerCase().trim()

  // Intent detection
  const intent = detectIntent(normalizedInput)

  // Entity extraction
  const entities = extractEntities(normalizedInput)

  // Sentiment analysis (simple version)
  const sentiment = analyzeSentiment(normalizedInput)

  // Update context based on current understanding
  updateContext(intent, entities)

  return {
    intent,
    entities,
    sentiment,
    context: conversationContext,
  }
}

/**
 * Detect the primary intent from user input
 */
function detectIntent(input: string): Intent {
  let bestMatch = {
    name: "unknown",
    confidence: 0,
    entities: {},
  }

  // Check each intent pattern
  for (const intentPattern of intentPatterns) {
    for (const pattern of intentPattern.patterns) {
      if (input.includes(pattern)) {
        // Calculate confidence based on how much of the input matches the pattern
        const patternWords = pattern.split(" ")
        const inputWords = input.split(" ")
        const matchRatio = patternWords.length / inputWords.length
        const confidence = Math.min(0.6 + matchRatio * 0.4, 0.95) // Cap at 0.95

        if (confidence > bestMatch.confidence) {
          bestMatch = {
            name: intentPattern.intent,
            confidence,
            entities: {},
          }
        }
      }
    }
  }

  // If we have a search intent, extract the search query
  if (bestMatch.name === "search") {
    const searchPatterns = ["search for", "find", "look for", "search"]
    let searchQuery = input

    for (const pattern of searchPatterns) {
      if (input.includes(pattern)) {
        searchQuery = input.split(pattern)[1]?.trim() || ""
        break
      }
    }

    bestMatch.entities.query = searchQuery
  }

  // If we have a play intent, extract the title
  if (bestMatch.name === "playback.play") {
    const playPatterns = ["play", "watch", "start", "stream"]
    let title = input

    for (const pattern of playPatterns) {
      if (input.includes(pattern)) {
        title = input.split(pattern)[1]?.trim() || ""
        break
      }
    }

    bestMatch.entities.title = title
  }

  return bestMatch
}

/**
 * Extract entities from user input
 */
function extractEntities(input: string): Record<string, any> {
  const entities: Record<string, any> = {}

  // Extract genres
  for (const genre of entityPatterns.genre) {
    if (input.includes(genre)) {
      entities.genre = genre
      break
    }
  }

  // Extract time periods
  for (const period of entityPatterns.time_period) {
    if (input.includes(period)) {
      entities.time_period = period
      break
    }
  }

  // Extract ratings
  for (const rating of entityPatterns.rating) {
    if (input.includes(rating)) {
      entities.rating = rating
      break
    }
  }

  // Extract language
  for (const language of entityPatterns.language) {
    if (input.includes(language)) {
      entities.language = language
      break
    }
  }

  // Extract content type
  for (const type of entityPatterns.content_type) {
    if (input.includes(type)) {
      entities.content_type = type
      break
    }
  }

  return entities
}

/**
 * Simple sentiment analysis
 */
function analyzeSentiment(input: string): number {
  const positiveWords = ["good", "great", "awesome", "excellent", "amazing", "love", "like", "enjoy", "best"]
  const negativeWords = ["bad", "terrible", "awful", "worst", "hate", "dislike", "boring", "stupid", "waste"]

  let score = 0
  const words = input.split(" ")

  for (const word of words) {
    if (positiveWords.includes(word)) score += 0.2
    if (negativeWords.includes(word)) score -= 0.2
  }

  return Math.max(-1, Math.min(1, score)) // Clamp between -1 and 1
}

/**
 * Update conversation context
 */
function updateContext(intent: Intent, entities: Record<string, any>): void {
  // Maintain context for 5 minutes
  if (!conversationContext.lastUpdated || Date.now() - conversationContext.lastUpdated > 5 * 60 * 1000) {
    conversationContext = {}
  }

  // Update context with current intent and entities
  conversationContext = {
    ...conversationContext,
    lastIntent: intent.name,
    lastEntities: entities,
    lastUpdated: Date.now(),
  }

  // Special context handling for specific intents
  if (intent.name === "search" && entities.genre) {
    conversationContext.preferredGenre = entities.genre
  }

  if (intent.name.startsWith("playback") && intent.entities.title) {
    conversationContext.lastTitle = intent.entities.title
  }
}

/**
 * Generate a natural language response based on NLP result
 */
export function generateResponse(result: NLPResult): string {
  const { intent, entities, sentiment, context } = result

  // Handle different intents with varied responses
  switch (intent.name) {
    case "navigation.home":
      return getRandomResponse([
        "Taking you to the home page",
        "Going to the home page now",
        "Navigating to the main page",
        "Home page coming right up",
      ])

    case "navigation.movies":
      return getRandomResponse([
        "Here are all the movies",
        "Taking you to the movies section",
        "Showing you our movie collection",
        "Let's check out some movies",
      ])

    case "navigation.shows":
      return getRandomResponse([
        "Here are all the TV shows",
        "Taking you to the shows section",
        "Showing you our TV series collection",
        "Let's find you a great show to watch",
      ])

    case "navigation.mylist":
      return getRandomResponse([
        "Here's your watchlist",
        "Opening your saved content",
        "Here are the titles you've saved",
        "Your personal collection is ready",
      ])

    case "navigation.profile":
      return getRandomResponse([
        "Opening your profile",
        "Here are your account settings",
        "Taking you to your profile page",
        "Your profile information is ready",
      ])

    case "search":
      if (entities.query) {
        return getRandomResponse([
          `Searching for "${entities.query}"`,
          `Looking up "${entities.query}" for you`,
          `Finding results for "${entities.query}"`,
          `Searching our library for "${entities.query}"`,
        ])
      }
      return "What would you like to search for?"

    case "playback.play":
      if (intent.entities.title) {
        return getRandomResponse([
          `Playing "${intent.entities.title}"`,
          `Starting "${intent.entities.title}" for you`,
          `Now playing "${intent.entities.title}"`,
          `Enjoy watching "${intent.entities.title}"`,
        ])
      }
      return "What would you like to watch?"

    case "playback.resume":
      return getRandomResponse([
        "Picking up where you left off",
        "Continuing your last watch",
        "Resuming your content",
        "Let's continue what you were watching",
      ])

    case "recommendation":
      let response = "Here are some recommendations for you"

      if (entities.genre) {
        response = getRandomResponse([
          `Here are some great ${entities.genre} options for you`,
          `I think you'll enjoy these ${entities.genre} titles`,
          `Check out these ${entities.genre} recommendations`,
          `Based on your interest in ${entities.genre}, you might like these`,
        ])
      }

      if (entities.rating && entities.genre) {
        response = getRandomResponse([
          `Here are the ${entities.rating} ${entities.genre} titles`,
          `I found some ${entities.rating} ${entities.genre} content for you`,
          `You'll love these ${entities.rating} ${entities.genre} picks`,
        ])
      }

      return response

    case "help":
      return "I can help you navigate GlobalStream. Try saying: 'go home', 'show movies', 'search for action', 'play Stranger Things', 'recommend comedy', or 'open my list'"

    default:
      return "I'm not sure how to help with that. Try asking for movies, TV shows, or search for a title."
  }
}

/**
 * Get a random response from an array of possible responses
 */
function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * Reset the conversation context
 */
export function resetContext(): void {
  conversationContext = {}
}
