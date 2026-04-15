<?php

namespace App\Services;

use OpenAI\Client;

class AIReviewService
{
    protected $client;

    public function __construct()
    {
        $this->client = \OpenAI::client(env('OPENAI_API_KEY'));
    }

    public function generateMonthlyReview($student, $logs, $attendance)
    {
        $structuredData = [
            'student' => $student->name,
            'logs' => $logs,
            'attendance' => $attendance
        ];

        $prompt = "
You are an external SIWES supervisor.

Analyze the student's monthly performance based on the data below.

Return structured evaluation:

1. Summary
2. Evaluation
3. Strengths
4. Weaknesses
5. Recommendations
6. Rating (Excellent, Good, Average, Poor)

DATA:
" . json_encode($structuredData);

        $response = $this->client->chat()->create([
            'model' => 'gpt-5.4',
            'messages' => [
                ['role' => 'system', 'content' => 'You are a strict academic supervisor.'],
                ['role' => 'user', 'content' => $prompt],
            ],
        ]);

        return $response->choices[0]->message->content;
    }
}