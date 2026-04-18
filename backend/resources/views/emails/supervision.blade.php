<h2>Online Supervision Session</h2>

<p><strong>Title:</strong> {{ $session->title }}</p>
<p><strong>Date:</strong> {{ \Carbon\Carbon::parse($session->scheduled_at)->format('F j, Y g:i A') }}</p>
<p><strong>Duration:</strong> {{ $session->duration_minutes }} minutes</p>

<p>Please ensure your location matches your SIWES organization before joining.</p>

<p><a href="{{ $session->join_url }}">Join Session</a></p>