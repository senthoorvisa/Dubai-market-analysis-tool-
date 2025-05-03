import { OpenAI } from 'openai';

/**
 * Prompt templates for different Dubai real estate analysis scenarios
 */
export const promptTemplates = {
  marketOverview: {
    system: `You are a Dubai real-estate analyst. 
Use the following data to summarize price trends from {start_date} to {end_date}.`,
    context: `{retrieved_chunks}`,
    user: `Generate a 300-word bilingual (EN/AR) overview.`
  },
  
  appreciationForecast: {
    system: `You are a forecasting assistant.`,
    user: `Based on these price points, predict next 12 months of average ROI.`
  },
  
  propertyAnalysis: {
    system: `You are a Dubai real estate expert with deep knowledge of the market.
Analyze the following property information and provide insights.`,
    context: `{property_data}`,
    user: `Provide a comprehensive analysis of this property including valuation assessment, 
market position, investment potential, and neighborhood insights.`
  },
  
  developerAnalysis: {
    system: `You are a Dubai real estate market analyst specializing in developer evaluations.
Analyze the following developer information and provide insights.`,
    context: `{developer_data}`,
    user: `Provide a detailed analysis of this developer including reputation, quality of projects, 
delivery track record, and current market standing.`
  },
  
  neighborhoodAnalysis: {
    system: `You are a Dubai neighborhood specialist with expertise in area demographics and trends.
Analyze the following neighborhood data and provide insights.`,
    context: `{neighborhood_data}`,
    user: `Provide a detailed analysis of this neighborhood including demographics, amenities, 
infrastructure, and future development plans.`
  }
};

/**
 * Function calling schemas for OpenAI function calling
 */
export const functionSchemas = [
  {
    name: "generate_chart",
    description: "Generates a chart based on price or trend data",
    parameters: {
      type: "object",
      properties: {
        data: {
          type: "array",
          description: "Array of data points for the chart",
          items: {
            type: "object",
            properties: {
              x: { type: "string", description: "X-axis label (usually date)" },
              y: { type: "number", description: "Y-axis value (usually price)" }
            },
            required: ["x", "y"]
          }
        },
        chart_type: {
          type: "string",
          description: "Type of chart to generate",
          enum: ["line", "bar", "scatter", "area"]
        },
        title: {
          type: "string",
          description: "Chart title"
        },
        x_axis_label: {
          type: "string",
          description: "X-axis label"
        },
        y_axis_label: {
          type: "string",
          description: "Y-axis label"
        }
      },
      required: ["data", "chart_type"]
    }
  },
  {
    name: "forecast_time_series",
    description: "Forecasts future values based on historical price data",
    parameters: {
      type: "object",
      properties: {
        prices: {
          type: "array",
          description: "Array of historical price points",
          items: {
            type: "number"
          }
        },
        dates: {
          type: "array",
          description: "Array of dates corresponding to price points",
          items: {
            type: "string",
            description: "Date in ISO format (YYYY-MM-DD)"
          }
        },
        periods: {
          type: "number",
          description: "Number of periods to forecast into the future"
        },
        interval: {
          type: "string",
          description: "Time interval between periods",
          enum: ["day", "week", "month", "quarter", "year"]
        },
        confidence_level: {
          type: "number",
          description: "Confidence level for forecast intervals (0-1)",
          default: 0.95
        }
      },
      required: ["prices", "dates", "periods", "interval"]
    }
  },
  {
    name: "format_table",
    description: "Formats data into a markdown table",
    parameters: {
      type: "object",
      properties: {
        data: {
          type: "array",
          description: "Array of objects to format into a table",
          items: {
            type: "object",
            description: "Row data for the table"
          }
        },
        headers: {
          type: "array",
          description: "Column headers for the table",
          items: {
            type: "string"
          }
        },
        alignment: {
          type: "array",
          description: "Alignment for each column (left, center, right)",
          items: {
            type: "string",
            enum: ["left", "center", "right"]
          }
        }
      },
      required: ["data"]
    }
  },
  {
    name: "translate_text",
    description: "Translates text between English and Arabic",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Text to translate"
        },
        target_language: {
          type: "string",
          description: "Target language for translation",
          enum: ["en", "ar"]
        }
      },
      required: ["text", "target_language"]
    }
  },
  {
    name: "extract_key_metrics",
    description: "Extracts key metrics from property data",
    parameters: {
      type: "object",
      properties: {
        property_type: {
          type: "string",
          description: "Type of property (apartment, villa, etc.)"
        },
        location: {
          type: "string",
          description: "Location of the property"
        },
        metrics: {
          type: "array",
          description: "List of metrics to extract",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Name of the metric" },
              value: { type: "number", description: "Value of the metric" },
              unit: { type: "string", description: "Unit of the metric (%, AED, etc.)" },
              trend: { type: "string", description: "Trend direction (up, down, stable)" }
            },
            required: ["name", "value"]
          }
        }
      },
      required: ["property_type", "location", "metrics"]
    }
  }
];

/**
 * Creates a filled prompt template with provided variables
 */
export function fillPromptTemplate(template: any, variables: Record<string, string>): any {
  // Create a deep copy of the template
  const filledTemplate = JSON.parse(JSON.stringify(template));
  
  // Fill in variables for each field
  for (const key in filledTemplate) {
    if (typeof filledTemplate[key] === 'string') {
      // Replace placeholders with actual values
      filledTemplate[key] = filledTemplate[key].replace(
        /\{([^}]+)\}/g,
        (match, p1) => variables[p1] || match
      );
    }
  }
  
  return filledTemplate;
}

/**
 * Creates OpenAI messages array from a template
 */
export function createMessagesFromTemplate(
  template: any,
  variables: Record<string, string>
): Array<OpenAI.ChatCompletionMessageParam> {
  const filledTemplate = fillPromptTemplate(template, variables);
  const messages: Array<OpenAI.ChatCompletionMessageParam> = [];
  
  // Add system message if present
  if (filledTemplate.system) {
    messages.push({
      role: 'system',
      content: filledTemplate.system
    });
  }
  
  // Add context as assistant message if present
  if (filledTemplate.context) {
    messages.push({
      role: 'user',
      content: `Here is the context to help with your analysis:\n\n${filledTemplate.context}`
    });
    
    messages.push({
      role: 'assistant',
      content: 'I understand. I will analyze this information to help with your query.'
    });
  }
  
  // Add user message
  if (filledTemplate.user) {
    messages.push({
      role: 'user',
      content: filledTemplate.user
    });
  }
  
  return messages;
}

export default {
  promptTemplates,
  functionSchemas,
  fillPromptTemplate,
  createMessagesFromTemplate
}; 