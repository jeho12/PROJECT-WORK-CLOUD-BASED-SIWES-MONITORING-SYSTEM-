<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogbookDay;
use App\Models\LogbookDayAttachment;
use Illuminate\Http\Request;

class LogbookAttachmentController extends Controller
{
    public function upload(Request $request, $logbookDayId)
    {
        $day = LogbookDay::where('id', $logbookDayId)
            ->whereHas('logbookWeek', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->firstOrFail();

        if ($day->locked) {
            return response()->json([
                'message' => 'This day is locked. You can no longer upload attachments.',
            ], 422);
        }

        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,pdf,doc,docx',
                'max:5120',
            ],
        ]);

        $file = $request->file('file');
        $path = $file->store('logbook-attachments', 'public');

        $attachment = LogbookDayAttachment::create([
            'logbook_day_id' => $day->id,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return response()->json([
            'message' => 'Attachment uploaded successfully.',
            'attachment' => $attachment,
        ]);
    }

    public function destroy(Request $request, $attachmentId)
    {
        $attachment = LogbookDayAttachment::where('id', $attachmentId)
            ->whereHas('logbookDay.logbookWeek', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->firstOrFail();

        if ($attachment->logbookDay->locked) {
            return response()->json([
                'message' => 'This attachment can no longer be removed.',
            ], 422);
        }

        $attachment->delete();

        return response()->json([
            'message' => 'Attachment removed successfully.',
        ]);
    }
}