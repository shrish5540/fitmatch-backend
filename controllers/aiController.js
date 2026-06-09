const Groq = require('groq-sdk')
const User = require('../models/User')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const getWorkoutPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (user.workoutPlan) {
      return res.status(200).json({ workoutPlan: user.workoutPlan })
    }


    const prompt = `
Generate a weekly gym workout plan.

Return ONLY valid JSON.

Format:

{
  "title": "Weekly Workout Plan",
  "days": [
    {
      "day": "Monday",
      "focus": "Upper Body + Cardio",
      "exercises": [
        "Bench Press",
        "Rows",
        "Pushups"
      ]
    }
  ]
}

User Details:
Goal: ${user.goal}
Fitness Level: ${user.fitnessLevel}
Gym Type: ${user.gymType || "General Gym"}

Requirements:
- Create 5 to 7 workout days.
- Include a focus area for each day.
- Include 3 to 6 exercises per day.
- Use realistic gym exercises.
- Return ONLY valid JSON.
- Do not include markdown.
- Do not include explanation text.
- Do not wrap JSON in \`\`\`.

JSON:
`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }]
    })
   const aiResponse = response.choices[0].message.content

const cleaned = aiResponse
  .replace(/```json/g, '')
  .replace(/```/g, '')
  .trim()
console.log("AI RESPONSE:")
console.log(aiResponse)
const workoutPlan = JSON.parse(cleaned)


    user.workoutPlan = workoutPlan
    await user.save()

    res.status(200).json({ workoutPlan })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getDietPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

     if (user.dietPlan) {
       return res.status(200).json({ dietPlan: user.dietPlan })
     }

    
const prompt = `
Generate a personalized Indian diet plan.

Return ONLY valid JSON.

Format:

{
"goal": "Muscle Gain",
"dailyCalories": 2800,
"proteinTarget": "170g",

"breakfast": [
"Paneer Bhurji",
"Oats",
"Banana"
],

"lunch": [
"Roti",
"Dal",
"Chicken Curry",
"Salad"
],

"snacks": [
"Greek Yogurt",
"Roasted Chana",
"Apple"
],

"dinner": [
"Roti",
"Paneer",
"Mixed Vegetables",
"Curd"
]
}

User Details:
Goal: ${user.goal}
Age: ${user.age}
Gender: ${user.gender}
Height: ${user.height} cm
Weight: ${user.weight} kg
Fitness Level: ${user.fitnessLevel}

Requirements:

* Estimate daily calorie needs based on the user's goal, age, gender, height and weight.
* Include a realistic dailyCalories value as a number.
* Include a realistic proteinTarget value as a string (example: "170g").
* Match the meal plan to the user's fitness goal.
* Prefer Indian foods and meals.
* Use foods commonly available in India.
* Include foods such as roti, rice, dal, paneer, curd, poha, upma, idli, dosa, eggs, chicken, fish, vegetables, fruits and nuts where appropriate.
* Make the diet practical and affordable for an average Indian gym-goer.
* Avoid overly western meal plans unless necessary.
* Give 3 to 5 food items per meal.
* Avoid duplicate foods whenever possible.
* Return ONLY valid JSON.
* Do NOT include markdown.
* Do NOT include explanations.
* Do NOT include calorie calculations.
* Do NOT include text before JSON.
* Do NOT include text after JSON.
* Do NOT wrap the JSON in code blocks.

JSON:
`

    const response = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [{ role: 'user', content: prompt }]
})

const aiResponse = response.choices[0].message.content


const cleaned = aiResponse
  .replace(/```json/g, '')
  .replace(/```/g, '')
  .trim()

const dietPlan = JSON.parse(cleaned)
    
    user.dietPlan = dietPlan
    await user.save()

    res.status(200).json({ dietPlan })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const askCoach = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const { question } = req.body

    if (!question) {
      return res.status(400).json({ message: 'Question is required' })
    }

    const prompt = `
You are FitMatch AI Coach.

User Profile:
- Goal: ${user.goal}
- Fitness Level: ${user.fitnessLevel}
- Gym Type: ${user.gymType}
- Height: ${user.height} cm
- Weight: ${user.weight} kg

User Question:
${question}

Rules:
- Give practical fitness advice.
- Keep answers concise and actionable.
- Use bullet points whenever possible.
- Use Indian food examples when discussing nutrition.
- Do not use greetings like "Namaste", "Hello", or "my friend".
- Do not give long motivational speeches.
- Do not repeat the user's question.
- Keep most answers under 200 words.
- Use markdown formatting.
- If calculations are needed, calculate using the user's profile.

## Protein Intake for Muscle Gain

**Weight:** 75 kg

**Recommended Protein:** 120–165g/day

### High Protein Indian Foods

- Chicken breast (30–35g)
- Fish curry (25–30g)
- Paneer tikka (20–25g)
- Dal makhani (15–20g)

### Tips

- Spread protein across 4–5 meals
- Include protein in every meal
- Stay hydrated

- Use markdown.
- Use bullet points.
- Keep paragraphs to a maximum of 2 lines.
- Avoid blank lines between every sentence.
- Keep answers compact and mobile-friendly.
Answer:
`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }]
    })

    const answer = response.choices[0].message.content

    res.status(200).json({ answer })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
module.exports = { getWorkoutPlan, getDietPlan , askCoach}