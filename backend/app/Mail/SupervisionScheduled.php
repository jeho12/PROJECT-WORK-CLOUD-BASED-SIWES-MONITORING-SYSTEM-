<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class SupervisionScheduled extends Mailable
{
    public $session;

    public function __construct($session)
    {
        $this->session = $session;
    }

    public function build()
    {
        return $this->subject('Online Supervision Scheduled')
            ->view('emails.supervision');
    }
}