

<script lang="ts">
  import Flower from "../flower/+page.svelte";
   import Calendar from "../calendar/+page.svelte";
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
    <div class="container mx-auto px-4 py-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <i class="fas fa-regular fa-spa text-teal-300"></i>
          <h1 class="text-2xl font-heading font-bold">Shiatsu</h1>
        </div>
        <nav class="hidden md:flex space-x-6">
          <a href="./home" class="hover:text-teal-300 transition">Startseite</a>
          <a href="./booking" class="hover:text-teal-300 transition">Buchungen</a>
          <a href="./about" class="hover:text-teal-300 transition">Über mich</a>
        </nav>
        <button class="md:hidden text-2xl">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>
  </header>


  <section class="py-12 bg-gray-50">
    <Calendar></Calendar>
  </section>

  {#if isBookingFormVisible}
    <div
      on:click={hideBookingForm}
      class="backgroundBuchungAktiv fixed inset-0 flex justify-center items-center z-40"
      role="dialog"
      aria-modal="true"
    >
      <div on:click|stopPropagation class="relative bg-white rounded-xl shadow-lg p-8 m-4 max-w-lg w-full z-50">
        <h3 class="text-2xl font-heading text-gray-800 mb-6">Buchung abschließen</h3>
        {#if selectedDate}
          <p class="text-gray-700 mb-4">
            Ausgewähltes Datum: <span class="font-semibold">{selectedDate.toLocaleDateString('de-DE')}</span>
          </p>
        {/if}

        {#if bookingFormError}
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong class="font-bold">Fehler!</strong>
            <span class="block sm:inline">{bookingFormError}</span>
          </div>
        {/if}

        <form on:submit|preventDefault={addBooking}>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2" for="time">Uhrzeit</label>
            <select
              id="time"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              bind:value={newBookingTime}
            >
              {#each availableTimes as time}
                <option value={time}>{time}</option>
              {/each}
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2" for="name">Vollständiger Name</label>
            <input
              type="text"
              id="name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              bind:value={newBookingName}
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2" for="email">E-Mail</label>
            <input
              type="email"
              id="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              bind:value={newBookingEmail}
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2" for="phone">Telefonnummer</label>
            <input
              type="tel"
              id="phone"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              bind:value={newBookingPhone}
              required
            />
          </div>
          <div class="flex justify-between mt-6">
            <button
              type="button"
              on:click={hideBookingForm}
              class="px-4 py-2 text-gray-600 hover:text-teal-700"
            >
              Zurück
            </button>
            <button
              type="submit"
              class="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition shadow"
            >
              Buchung bestätigen
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
  {#if showSuccessAnimation}
    <div class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl bg-green-500 text-white fade-in-out">
      {animationMessage}
    </div>
  {/if}

  <section class="py-12 bg-gray-50">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-heading text-center mb-12 text-gray-800">Angebote</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-200">
          <div class="text-teal-600 text-4xl mb-4">
            <i class="fas fa-spa"></i>
          </div>
          <h3 class="text-xl font-heading mb-2 text-gray-800">Angebot1</h3>
          <p class="text-gray-600">Hier kann ein Text über das Angebot stehen.</p>
          <p class="mt-4 font-bold text-teal-700">$80</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-200">
          <div class="text-teal-600 text-4xl mb-4">
            <i class="fas fa-leaf"></i>
          </div>
          <h3 class="text-xl font-heading mb-2 text-gray-800">Angebot2</h3>
          <p class="text-gray-600">Hier kann ein Text über das Angebot stehen.</p>
          <p class="mt-4 font-bold text-teal-700">$80</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-200">
          <div class="text-teal-600 text-4xl mb-4">
            <i class="fas fa-water"></i>
          </div>
          <h3 class="text-xl font-heading mb-2 text-gray-800">Angebot3</h3>
          <p class="text-gray-600">Hier kann ein Text über das Angebot stehen.</p>
          <p class="mt-4 font-bold text-teal-700">$80</p>
        </div>
      </div>
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