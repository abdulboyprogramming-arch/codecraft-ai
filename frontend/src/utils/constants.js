/**
 * CodeCraft AI - Constants
 * 
 * This module contains application-wide constants.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

// ============================================
// App Constants
// ============================================

export const APP_NAME = 'CodeCraft AI'
export const APP_VERSION = '0.1.0'
export const APP_DESCRIPTION = 'AI-powered code review assistant'

// ============================================
// API Constants
// ============================================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
export const API_TIMEOUT = 30000 // 30 seconds

// ============================================
// Language Constants
// ============================================

export const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
]

// ============================================
// Feedback Categories
// ============================================

export const FEEDBACK_CATEGORIES = [
  { key: 'logic', label: 'Logic Errors', icon: '🔍', color: 'error' },
  { key: 'efficiency', label: 'Efficiency', icon: '⚡', color: 'warning' },
  { key: 'style', label: 'Code Style', icon: '🎨', color: 'info' },
  { key: 'security', label: 'Security', icon: '🔒', color: 'error' },
]

// ============================================
// Severity Levels
// ============================================

export const SEVERITY_LEVELS = {
  info: { label: 'Info', color: 'blue' },
  warning: { label: 'Warning', color: 'yellow' },
  error: { label: 'Error', color: 'red' },
}

// ============================================
// Routes
// ============================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  REVIEWS: '/reviews',
  REVIEW_DETAIL: (id) => `/reviews/${id}`,
}

// ============================================
// Local Storage Keys
// ============================================

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebarState',
}

// ============================================
// Code Examples
// ============================================

export const CODE_EXAMPLES = {
  javascript: `// JavaScript Example
function calculateSum(numbers) {
  let total = 0;
  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }
  return total;
}

const result = calculateSum([1, 2, 3, 4, 5]);
console.log(result);`,

  python: `# Python Example
def calculate_sum(numbers):
    total = 0
    for num in numbers:
        total += num
    return total

result = calculate_sum([1, 2, 3, 4, 5])
print(result)`,

  java: `// Java Example
public class Calculator {
    public static int calculateSum(int[] numbers) {
        int total = 0;
        for (int i = 0; i < numbers.length; i++) {
            total += numbers[i];
        }
        return total;
    }
    
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        int result = calculateSum(numbers);
        System.out.println(result);
    }
}`,
}

// ============================================
// Export
// ============================================

export default {
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  API_BASE_URL,
  API_TIMEOUT,
  SUPPORTED_LANGUAGES,
  FEEDBACK_CATEGORIES,
  SEVERITY_LEVELS,
  ROUTES,
  STORAGE_KEYS,
  CODE_EXAMPLES,
}
