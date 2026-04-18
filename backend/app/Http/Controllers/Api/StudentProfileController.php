<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use Illuminate\Http\Request;

class StudentProfileController extends Controller
{
    public function show(Request $request)
    {
        $profile = StudentProfile::where('user_id', $request->user()->id)->first();

        return response()->json([
            'profile' => $profile,
            'is_complete' => $profile ? $profile->is_complete : false,
        ]);
    }

    public function storeOrUpdate(Request $request)
    {
        $existingProfile = $request->user()->studentProfile;

        $validated = $request->validate([
            'matric_number' => [
                'required',
                'string',
                'max:255',
                'unique:student_profiles,matric_number,' . optional($existingProfile)->id,
            ],
            'department' => ['required', 'string', 'max:255'],
            'faculty' => ['required', 'string', 'max:255'],
            'level' => ['required', 'string', 'max:255'],
            'school_email' => [
                'required',
                'email',
                'max:255',
                'ends_with:@student.aul.edu.ng,@aul.edu.ng',
                'unique:student_profiles,school_email,' . optional($existingProfile)->id,
            ],
            'organization_name' => ['nullable', 'string', 'max:255'],
            'organization_address' => ['nullable', 'string', 'max:255'],
            'organization_latitude' => ['nullable', 'numeric'],
            'organization_longitude' => ['nullable', 'numeric'],
            'industry_supervisor_name' => ['nullable', 'string', 'max:255'],
            'industry_supervisor_email' => ['nullable', 'email', 'max:255'],
            'industry_supervisor_phone' => ['nullable', 'string', 'max:255'],
            'training_start_date' => ['nullable', 'date'],
            'training_end_date' => ['nullable', 'date', 'after_or_equal:training_start_date'],
            'passport' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ], [
            'school_email.ends_with' => 'School email must end with @student.aul.edu.ng or @aul.edu.ng.',
        ]);

        if ($request->hasFile('passport')) {
            $validated['passport_path'] = $request->file('passport')->store('passports', 'public');
        }

        unset($validated['passport']);

        $profile = StudentProfile::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json([
            'message' => 'Profile saved successfully',
            'profile' => $profile->fresh(),
            'is_complete' => $profile->fresh()->is_complete,
        ]);
    }
}