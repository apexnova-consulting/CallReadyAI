// External API integration service for Buyer Intent Signals
// Integrates with multiple data sources for comprehensive prospect intelligence

interface BuyerIntentData {
  funding: {
    rounds: Array<{
      date: string
      amount: string
      stage: string
      investors: string[]
    }>
    totalRaised: string
    lastRound: string
  }
  hiring: {
    activePostings: number
    keyRoles: string[]
    departmentGrowth: string[]
    recentHires: Array<{
      role: string
      department: string
      date: string
    }>
  }
  techStack: {
    recentChanges: string[]
    newTools: string[]
    infrastructure: string[]
  }
  news: Array<{
    title: string
    summary: string
    date: string
    sentiment: 'positive' | 'neutral' | 'negative'
    relevance: number
  }>
  companyMetrics: {
    employeeCount: string
    revenue: string
    growthRate: string
    marketCap?: string
  }
}

class BuyerIntentService {
  private rapidApiKey: string
  private clearbitApiKey: string

  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY || ''
    this.clearbitApiKey = process.env.CLEARBIT_API_KEY || ''
  }

  async getCompanyIntelligence(companyName: string, domain?: string): Promise<BuyerIntentData> {
    try {
      console.log(`Fetching buyer intent signals for ${companyName}`)
      
      // Run all data fetching in parallel for speed
      const [funding, hiring, techStack, news, metrics] = await Promise.allSettled([
        this.getFundingData(companyName),
        this.getHiringData(companyName),
        this.getTechStackData(domain || companyName),
        this.getNewsData(companyName),
        this.getCompanyMetrics(companyName, domain)
      ])

      return {
        funding: funding.status === 'fulfilled' ? funding.value : this.getDefaultFunding(),
        hiring: hiring.status === 'fulfilled' ? hiring.value : this.getDefaultHiring(),
        techStack: techStack.status === 'fulfilled' ? techStack.value : this.getDefaultTechStack(),
        news: news.status === 'fulfilled' ? news.value : this.getDefaultNews(),
        companyMetrics: metrics.status === 'fulfilled' ? metrics.value : this.getDefaultMetrics()
      }
    } catch (error) {
      console.error('Error fetching buyer intent signals:', error)
      return this.getDefaultBuyerIntentData()
    }
  }

  private async getFundingData(companyName: string) {
    try {
      // Crunchbase API integration
      if (this.rapidApiKey) {
        const response = await fetch(`https://crunchbase-crunchbase-v1.p.rapidapi.com/autocompletes?query=${encodeURIComponent(companyName)}`, {
          headers: {
            'X-RapidAPI-Key': this.rapidApiKey,
            'X-RapidAPI-Host': 'crunchbase-crunchbase-v1.p.rapidapi.com'
          }
        })

        if (response.ok) {
          const data = await response.json()
          // Process Crunchbase funding data
          return this.processFundingData(data)
        }
      }
    } catch (error) {
      console.error('Error fetching funding data:', error)
    }

    return this.getDefaultFunding()
  }

  private async getHiringData(companyName: string) {
    try {
      // LinkedIn Jobs API or Glassdoor integration
      if (this.rapidApiKey) {
        const response = await fetch(`https://linkedin-jobs-scraper-api.p.rapidapi.com/jobs?keywords=${encodeURIComponent(companyName)}&location=United%20States&page=1`, {
          headers: {
            'X-RapidAPI-Key': this.rapidApiKey,
            'X-RapidAPI-Host': 'linkedin-jobs-scraper-api.p.rapidapi.com'
          }
        })

        if (response.ok) {
          const data = await response.json()
          return this.processHiringData(data)
        }
      }
    } catch (error) {
      console.error('Error fetching hiring data:', error)
    }

    return this.getDefaultHiring()
  }

  private async getTechStackData(domain: string) {
    try {
      // BuiltWith or Wappalyzer API integration
      if (this.rapidApiKey) {
        const response = await fetch(`https://builtwith-io.p.rapidapi.com/api/builtwith?domain=${domain}`, {
          headers: {
            'X-RapidAPI-Key': this.rapidApiKey,
            'X-RapidAPI-Host': 'builtwith-io.p.rapidapi.com'
          }
        })

        if (response.ok) {
          const data = await response.json()
          return this.processTechStackData(data)
        }
      }
    } catch (error) {
      console.error('Error fetching tech stack data:', error)
    }

    return this.getDefaultTechStack()
  }

  private async getNewsData(companyName: string) {
    try {
      // News API integration
      if (this.rapidApiKey) {
        const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(companyName)}&sortBy=publishedAt&pageSize=10`, {
          headers: {
            'X-API-Key': this.rapidApiKey
          }
        })

        if (response.ok) {
          const data = await response.json()
          return this.processNewsData(data)
        }
      }
    } catch (error) {
      console.error('Error fetching news data:', error)
    }

    return this.getDefaultNews()
  }

  private async getCompanyMetrics(companyName: string, domain?: string) {
    try {
      // Clearbit or Apollo API integration
      if (this.clearbitApiKey && domain) {
        const response = await fetch(`https://company.clearbit.com/v2/companies/find?domain=${domain}`, {
          headers: {
            'Authorization': `Bearer ${this.clearbitApiKey}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          return this.processCompanyMetrics(data)
        }
      }
    } catch (error) {
      console.error('Error fetching company metrics:', error)
    }

    return this.getDefaultMetrics()
  }

  // Data processing methods
  private processFundingData(data: any) {
    // Process Crunchbase funding data
    return {
      rounds: data.funding_rounds?.map((round: any) => ({
        date: round.announced_on,
        amount: round.money_raised,
        stage: round.funding_type,
        investors: round.investor_names || []
      })) || [],
      totalRaised: data.total_funding || 'Unknown',
      lastRound: data.last_funding_type || 'Unknown'
    }
  }

  private processHiringData(data: any) {
    // Process hiring data
    const jobs = data.jobs || []
    const departments = [...new Set(jobs.map((job: any) => job.department).filter(Boolean))]
    
    return {
      activePostings: jobs.length,
      keyRoles: jobs.slice(0, 5).map((job: any) => job.title),
      departmentGrowth: departments.slice(0, 3),
      recentHires: jobs.slice(0, 3).map((job: any) => ({
        role: job.title,
        department: job.department || 'General',
        date: job.posted_date
      }))
    }
  }

  private processTechStackData(data: any) {
    // Process tech stack data
    const technologies = data.technologies || []
    
    return {
      recentChanges: technologies.slice(0, 5).map((tech: any) => tech.name),
      newTools: technologies.filter((tech: any) => tech.new).map((tech: any) => tech.name),
      infrastructure: technologies.filter((tech: any) => tech.category === 'Web Server').map((tech: any) => tech.name)
    }
  }

  private processNewsData(data: any) {
    // Process news data
    return (data.articles || []).map((article: any) => ({
      title: article.title,
      summary: article.description,
      date: article.publishedAt,
      sentiment: this.analyzeSentiment(article.description),
      relevance: this.calculateRelevance(article.title, article.description)
    })).filter((article: any) => article.relevance > 0.3)
  }

  private processCompanyMetrics(data: any) {
    return {
      employeeCount: data.metrics?.employees || 'Unknown',
      revenue: data.metrics?.revenue || 'Unknown',
      growthRate: data.metrics?.growth || 'Unknown',
      marketCap: data.metrics?.marketCap
    }
  }

  // Sentiment analysis helper
  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['growth', 'expansion', 'success', 'funding', 'hiring', 'partnership', 'launch']
    const negativeWords = ['layoffs', 'decline', 'loss', 'struggling', 'down', 'cut']
    
    const lowerText = text.toLowerCase()
    const positiveScore = positiveWords.filter(word => lowerText.includes(word)).length
    const negativeScore = negativeWords.filter(word => lowerText.includes(word)).length
    
    if (positiveScore > negativeScore) return 'positive'
    if (negativeScore > positiveScore) return 'negative'
    return 'neutral'
  }

  // Relevance calculation
  private calculateRelevance(title: string, description: string): number {
    const businessKeywords = ['funding', 'hiring', 'partnership', 'product', 'expansion', 'growth', 'revenue', 'acquisition']
    const text = `${title} ${description}`.toLowerCase()
    
    const matches = businessKeywords.filter(keyword => text.includes(keyword)).length
    return matches / businessKeywords.length
  }

  // Default data fallbacks
  private getDefaultBuyerIntentData(): BuyerIntentData {
    return {
      funding: this.getDefaultFunding(),
      hiring: this.getDefaultHiring(),
      techStack: this.getDefaultTechStack(),
      news: this.getDefaultNews(),
      companyMetrics: this.getDefaultMetrics()
    }
  }

  private getDefaultFunding() {
    return {
      rounds: [],
      totalRaised: 'Unknown',
      lastRound: 'Unknown'
    }
  }

  private getDefaultHiring() {
    return {
      activePostings: 0,
      keyRoles: [],
      departmentGrowth: [],
      recentHires: []
    }
  }

  private getDefaultTechStack() {
    return {
      recentChanges: [],
      newTools: [],
      infrastructure: []
    }
  }

  private getDefaultNews() {
    return []
  }

  private getDefaultMetrics() {
    return {
      employeeCount: 'Unknown',
      revenue: 'Unknown',
      growthRate: 'Unknown'
    }
  }

  // Format buyer intent signals for AI consumption
  formatForAI(buyerIntentData: BuyerIntentData): string {
    const signals = []
    
    if (buyerIntentData.funding.totalRaised !== 'Unknown') {
      signals.push(`Recent funding: ${buyerIntentData.funding.totalRaised} (${buyerIntentData.funding.lastRound})`)
    }
    
    if (buyerIntentData.hiring.activePostings > 0) {
      signals.push(`Active hiring: ${buyerIntentData.hiring.activePostings} open positions in ${buyerIntentData.hiring.departmentGrowth.join(', ')}`)
    }
    
    if (buyerIntentData.techStack.recentChanges.length > 0) {
      signals.push(`Tech stack changes: Recently adopted ${buyerIntentData.techStack.recentChanges.slice(0, 3).join(', ')}`)
    }
    
    if (buyerIntentData.news.length > 0) {
      const recentNews = buyerIntentData.news.slice(0, 2)
      signals.push(`Recent news: ${recentNews.map(n => n.title).join('; ')}`)
    }
    
    return signals.length > 0 ? signals.join('. ') : 'No significant buyer intent signals detected.'
  }
}

export const buyerIntentService = new BuyerIntentService()
export type { BuyerIntentData }
