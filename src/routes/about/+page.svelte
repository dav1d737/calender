

<script lang="ts">
  import Flower from "../slider/+page.svelte";
   import Calendar from "../calendar/+page.svelte";
    import Navigation from "../navigation/+page.svelte";
  interface Booking {
    id: number;
    name: string;
    date: string; // ISO 8601 String (YYYY-MM-DDTHH:mm:ss)
    email: string;
    phone: string;
  }

  let bookings: Booking[] = [
    { id: 1, name: 'Max Mustermann', date: '2025-07-15T10:00:00', email: 'max@example.com', phone: '0123456789' },
    { id: 2, name: 'Erika Mustermann', date: '2025-07-15T14:00:00', email: 'erika@example.com', phone: '0987654321' },
    { id: 3, name: 'John Doe', date: '2025-07-22T11:00:00', email: 'john@example.com', phone: '0234567890' },
    { id: 4, name: 'Jane Doe', date: '2025-08-01T09:00:00', email: 'jane@example.com', phone: '0345678901' }
  ];

  function toYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  $: bookingDatesSet = new Set(bookings.map((b) => toYYYYMMDD(new Date(b.date))));

  let currentDate = new Date();
  let selectedDate: Date | null = null;

  let newBookingName: string = '';
  let newBookingEmail: string = '';
  let newBookingPhone: string = '';
  let newBookingTime: string = '09:00';
  let bookingFormError: string = '';


  let showSuccessAnimation: boolean = false;
  let showFailureAnimation: boolean = false;
  let animationMessage: string = '';


  const availableTimes = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00'
  ];

  $: calendarDays = generateCalendarDays(currentDate);
  $: monthYearDisplay = currentDate.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric'
  });
  $: bookingsForSelectedDate = selectedDate
    ? bookings.filter((booking) => {
        const bookingDate = new Date(booking.date);
        return (
          bookingDate.getFullYear() === selectedDate!.getFullYear() &&
          bookingDate.getMonth() === selectedDate!.getMonth() &&
          bookingDate.getDate() === selectedDate!.getDate()
        );
      })
    : [];

  let isBookingFormVisible = false;

  function generateCalendarDays(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < startDayOfWeek; i++) {
      const day = new Date(year, month, i - startDayOfWeek + 1);
      days.push({ date: day, dayOfMonth: day.getDate(), isCurrentMonth: false, isToday: false, hasBookings: false });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const day = new Date(year, month, i);
      const hasBookings = bookingDatesSet.has(toYYYYMMDD(day));
      days.push({
        date: day,
        dayOfMonth: i,
        isCurrentMonth: true,
        isToday: day.getTime() === today.getTime(),
        hasBookings: hasBookings
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push({ date: day, dayOfMonth: day.getDate(), isCurrentMonth: false, isToday: false, hasBookings: false });
    }

    return days;
  }

  function goToPrevMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    selectedDate = null;
  }

  function goToNextMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    selectedDate = null;
  }

  function selectDay(day: { date: Date; isCurrentMonth: boolean }) {
    if (!day.isCurrentMonth) return;
    selectedDate = day.date;
  }

  function showBookingForm() {
    if (!selectedDate) {
      alert('Bitte wählen Sie zuerst ein Datum aus!');
      return;
    }
    newBookingName = '';
    newBookingEmail = '';
    newBookingPhone = '';
    newBookingTime = availableTimes[0];
    bookingFormError = '';
    isBookingFormVisible = true;
  }

  function hideBookingForm() {
    isBookingFormVisible = false;
    bookingFormError = '';
  }

  function addBooking() {
    bookingFormError = '';
    showSuccessAnimation = false;

    if (!newBookingName || !newBookingEmail || !newBookingPhone || !newBookingTime) {
      bookingFormError = 'Bitte füllen Sie alle Felder aus.';
      return;
    }
    if (!selectedDate) {
      bookingFormError = 'Es wurde kein Datum ausgewählt. Dies sollte nicht passieren.';
      return;
    }

    const [hours, minutes] = newBookingTime.split(':').map(Number);
    const newBookingDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours,
      minutes
    );

    // --- NEU: Kollisionsprüfung ---
    const newBookingTimeMillis = newBookingDateTime.getTime(); // Zeit der neuen Buchung in Millisekunden

    // Definiere den Zeitpuffer (1 Stunde vor und 1 Stunde nach der Buchung) in Millisekunden
    const oneHourInMillis = 60 * 60 * 1000;

    // Filtert alle Buchungen des aktuell ausgewählten Tages
    const bookingsOnSelectedDay = bookings.filter((booking) => {
        const existingBookingDate = new Date(booking.date);
        return (
          existingBookingDate.getFullYear() === selectedDate!.getFullYear() &&
          existingBookingDate.getMonth() === selectedDate!.getMonth() &&
          existingBookingDate.getDate() === selectedDate!.getDate()
        );
    });

    for (const existingBooking of bookingsOnSelectedDay) {
        const existingBookingTimeMillis = new Date(existingBooking.date).getTime();

        // Prüfe, ob die neue Buchung in den Puffer einer bestehenden Buchung fällt
        // Oder ob eine bestehende Buchung in den Puffer der neuen Buchung fällt
        const collision =
            (newBookingTimeMillis > existingBookingTimeMillis - oneHourInMillis &&
             newBookingTimeMillis < existingBookingTimeMillis + oneHourInMillis);
            // Man könnte auch genauer definieren:
            // newBookingStart < existingEnd && newBookingEnd > existingStart
            // Für 1-Stunden-Blöcke ist die obere Prüfung einfacher und ausreichend, wenn nur die Startzeiten verglichen werden.

        if (collision) {
            bookingFormError = `Kollision: Für diesen Zeitpunkt existiert bereits eine Buchung oder ist innerhalb einer Stunde um eine bestehende Buchung (z.B. ${new Date(existingBooking.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr).`;
            return; // Buchung nicht hinzufügen
        }
    }
    // --- ENDE: Kollisionsprüfung ---

    const newBooking: Booking = {
      id: bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1,
      name: newBookingName,
      date: newBookingDateTime.toISOString(),
      email: newBookingEmail,
      phone: newBookingPhone
    };

    bookings = [...bookings, newBooking];
    bookings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      hideBookingForm(); // Modal schließen
    // --- NEU: Erfolgsanimation anzeigen ---
    animationMessage = 'Buchung erfolgreich hinzugefügt!';
    showSuccessAnimation = true;
    setTimeout(() => (showSuccessAnimation = false), 3000); // 3 Sekunden anzeigen
  }
  
</script>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<div class="font-body text-base leading-relaxed text-gray-800">
  <header class="bg-gray-800 text-white shadow-lg">
    <Navigation></Navigation>
  </header>

 <section class="py-40 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="container mx-auto p-6 md:p-10 rounded-lg my-8">
    <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-6 border-b-2 pb-2">Impressum</h1>

    <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Angaben gemäß § 5 TMG:</h2>
        <p class="text-gray-600">
            <strong>[Dein vollständiger Name / Name deines Unternehmens]</strong><br>
            [Deine Straße und Hausnummer]<br>
            [Deine Postleitzahl und Ort]<br>
            [Dein Land]
        </p>
    </section>

    <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Kontakt:</h2>
        <p class="text-gray-600">
            Telefon: <a href="tel:[Deine Telefonnummer (optional)]" class="text-blue-600 hover:underline">[Deine Telefonnummer (optional)]</a><br>
            E-Mail: <a href="mailto:[Deine E-Mail-Adresse]" class="text-blue-600 hover:underline">[Deine E-Mail-Adresse]</a><br>
            Website: <a href="[Deine Website-Adresse]" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">[Deine Website-Adresse]</a>
        </p>
    </section>

    <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Vertreten durch (falls zutreffend):</h2>
        <p class="text-gray-600">
            [Vorname Nachname des Geschäftsführers / Vorstandes / Vertretungsberechtigten]
        </p>
    </section>

    <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Registereintrag (falls zutreffend):</h2>
        <p class="text-gray-600">
            Amtsgericht: [Zuständiges Amtsgericht]<br>
            Registernummer: [Deine Registernummer, z.B. HRB XXXX]
        </p>
    </section>

    <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG (falls zutreffend):</h2>
        <p class="text-gray-600">
            [Deine USt-IdNr.]
        </p>
    </section>

    <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Wirtschafts-Identifikationsnummer gemäß § 139c AO (falls zutreffend):</h2>
        <p class="text-gray-600">
            [Deine Wirtschafts-Identifikationsnummer]
        </p>
    </section>

    <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Inhaltlich Verantwortlicher gemäß § 55 Abs. 2 RStV (falls abweichend):</h2>
        <p class="text-gray-600">
            [Vorname Nachname des inhaltlich Verantwortlichen]<br>
            [Straße und Hausnummer des inhaltlich Verantwortlichen]<br>
            [Postleitzahl und Ort des inhaltlich Verantwortlichen]
        </p>
    </section>

    <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Berufsbezeichnung und kammerrechtliche Angaben (falls zutreffend):</h2>
        <p class="text-gray-600">
            Berufsbezeichnung: [Deine Berufsbezeichnung]<br>
            Zuständige Kammer: [Name der zuständigen Kammer]<br>
            Verliehen in: [Land, in dem die Berufsbezeichnung verliehen wurde]<br>
            Es gelten folgende berufsrechtliche Regelungen: [Liste der relevanten berufsrechtlichen Regelungen]<br>
            Diese können eingesehen werden unter: <a href="[Link zu den berufsrechtlichen Regelungen]" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">[Link zu den berufsrechtlichen Regelungen]</a>
        </p>
    </section>

    <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Streitschlichtung:</h2>
        <p class="text-gray-600 mb-2">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die du unter <a href="http://ec.europa.eu/consumers/odr/" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">http://ec.europa.eu/consumers/odr/</a> findest.
        </p>
        <p class="text-gray-600">
            Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
    </section>

    <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Haftung für Inhalte:</h2>
        <p class="text-gray-600">
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>
        <p class="text-gray-600 mt-2">
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
        </p>
    </section>

    <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Haftung für Links:</h2>
        <p class="text-gray-600">
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
        </p>
        <p class="text-gray-600 mt-2">
            Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
        </p>
    </section>

    <section>
        <h2 class="text-2xl font-semibold text-gray-700 mb-3">Urheberrecht:</h2>
        <p class="text-gray-600">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
        </p>
        <p class="text-gray-600 mt-2">
            Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Solltest du trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
        </p>
    </section>
</div>
    </div>
  </section>


   <section class="py-40 bg-gray-50">
    <div class="container mx-auto px-4">
      
    </div>
  </section>

  <footer class="bg-gray-800 text-white py-12">
    <!--<div class="container mx-auto px-4">
      <div class="grid md:grid-cols-4 gap-8">
        <div>
          <h4 class="text-xl font-heading font-bold mb-4">Zen Shiatsu</h4>
          <p class="text-gray-400">Restoring balance through traditional Japanese healing techniques.</p>
        </div>
        <div>
          <h4 class="text-lg font-heading font-semibold mb-4">Quick Links</h4>
          <ul class="space-y-2">
            <li><a href="#" class="text-gray-400 hover:text-white transition">Home</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition">Book Appointment</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition">Services</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition">About Us</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-heading font-semibold mb-4">Contact</h4>
          <ul class="space-y-2">
            <li class="flex items-center">
              <i class="fas fa-map-marker-alt mr-2 text-teal-400"></i>
              <span class="text-gray-400">123 Healing Way, Serenity City</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-phone mr-2 text-teal-400"></i>
              <span class="text-gray-400">(555) 123-4567</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-envelope mr-2 text-teal-400"></i>
              <span class="text-gray-400">contact@zenshiatsu.com</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-heading font-semibold mb-4">Follow Us</h4>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-400 hover:text-white transition text-xl">
              <i class="fab fa-facebook"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition text-xl">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition text-xl">
              <i class="fab fa-twitter"></i>
            </a>
          </div>
          <p class="mt-4 text-gray-400 text-sm">© 2023 Zen Shiatsu. All rights reserved.</p>
        </div>
      </div>
    </div>-->
  </footer>
</div>

<style>
	.flower{
		height: 30vh;
	}
  .backgroundBuchungAktiv {
    background-color: rgba(0, 0, 0, 0.4);
  }

  /* --- NEU: CSS für die Animationen --- */
  .fade-in-out {
    animation: fadeInOut 3s forwards; /* 3 Sekunden Dauer, bleibt am Ende sichtbar (oder würde verschwinden) */
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translateY(-20px);
    }
    10% {
      opacity: 1;
      transform: translateY(0);
    }
    90% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-20px);
    }
  }

  .slide-in-out {
    animation: slideInOut 3s forwards;
  }

  @keyframes slideInOut {
    0% {
      transform: translateX(100%);
    }
    10% {
      transform: translateX(0);
    }
    90% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(100%);
    }
  }
  .calendar-day:hover:not(.disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .time-slot:hover:not(.booked) {
    background-color: #2dd4bf; /* Tailwind teal-400 */
    color: white;
  }
  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>