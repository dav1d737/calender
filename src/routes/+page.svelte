<script lang="ts">
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
    today.setHours(0, 0, 0, 0); // Setzt die Uhrzeit auf Mitternacht für den Vergleich

    // Tage des Vormonats
    for (let i = 0; i < startDayOfWeek; i++) {
      const day = new Date(year, month, i - startDayOfWeek + 1);
      days.push({ date: day, dayOfMonth: day.getDate(), isCurrentMonth: false, isToday: false, hasBookings: false, isPast: true });
    }

    // Tage des aktuellen Monats
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const day = new Date(year, month, i);
      day.setHours(0, 0, 0, 0); // Setzt die Uhrzeit auf Mitternacht für den Vergleich
      const hasBookings = bookingDatesSet.has(toYYYYMMDD(day));
      const isPast = day.getTime() < today.getTime(); // Überprüfen, ob der Tag in der Vergangenheit liegt
      days.push({
        date: day,
        dayOfMonth: i,
        isCurrentMonth: true,
        isToday: day.getTime() === today.getTime(),
        hasBookings: hasBookings,
        isPast: isPast
      });
    }

    // Tage des nächsten Monats
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push({ date: day, dayOfMonth: day.getDate(), isCurrentMonth: false, isToday: false, hasBookings: false, isPast: false }); // Zukünftige Tage sind nicht in der Vergangenheit
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

  function selectDay(day: { date: Date; isCurrentMonth: boolean; isPast: boolean }) {
    // Nur Tage im aktuellen Monat und zukünftige Tage/heute wählbar
    if (!day.isCurrentMonth || day.isPast) return;
    selectedDate = day.date;
  }

  function showBookingForm() {
    if (!selectedDate) {
      alert('Bitte wählen Sie zuerst ein Datum aus!');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Setzt die Uhrzeit auf Mitternacht für den Vergleich
    selectedDate.setHours(0, 0, 0, 0); // Setzt die Uhrzeit des ausgewählten Datums auf Mitternacht für den Vergleich

    if (selectedDate.getTime() < today.getTime()) {
      alert('Veraltete Tage können nicht gebucht werden.');
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
    showFailureAnimation = false; // Zurücksetzen der Fehlermeldungs-Animation

    if (!newBookingName || !newBookingEmail || !newBookingPhone || !newBookingTime) {
      bookingFormError = 'Bitte füllen Sie alle Felder aus.';
      animationMessage = bookingFormError;
      showFailureAnimation = true;
      setTimeout(() => (showFailureAnimation = false), 3000);
      return;
    }
    if (!selectedDate) {
      bookingFormError = 'Es wurde kein Datum ausgewählt. Dies sollte nicht passieren.';
      animationMessage = bookingFormError;
      showFailureAnimation = true;
      setTimeout(() => (showFailureAnimation = false), 3000);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate.getTime() < today.getTime()) {
      bookingFormError = 'Buchungen für veraltete Tage sind nicht erlaubt.';
      animationMessage = bookingFormError;
      showFailureAnimation = true;
      setTimeout(() => (showFailureAnimation = false), 3000);
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

    // NEU: Zusätzliche Prüfung, ob die Buchungszeit in der Vergangenheit liegt (wenn der Tag heute ist)
    const now = new Date();
    if (newBookingDateTime.getTime() < now.getTime()) {
      bookingFormError = 'Die ausgewählte Uhrzeit liegt in der Vergangenheit.';
      animationMessage = bookingFormError;
      showFailureAnimation = true;
      setTimeout(() => (showFailureAnimation = false), 3000);
      return;
    }


    // --- Kollisionsprüfung ---
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

        const collision =
            (newBookingTimeMillis > existingBookingTimeMillis - oneHourInMillis &&
             newBookingTimeMillis < existingBookingTimeMillis + oneHourInMillis);

        if (collision) {
            bookingFormError = `Kollision: Für diesen Zeitpunkt existiert bereits eine Buchung oder ist innerhalb einer Stunde um eine bestehende Buchung (z.B. ${new Date(existingBooking.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr).`;
            animationMessage = bookingFormError;
            showFailureAnimation = true;
            setTimeout(() => (showFailureAnimation = false), 3000);
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
    // --- Erfolgsanimation anzeigen ---
    animationMessage = 'Buchung erfolgreich hinzugefügt!';
    showSuccessAnimation = true;
    setTimeout(() => (showSuccessAnimation = false), 3000); // 3 Sekunden anzeigen
  }

</script>
    <header class="bg-indigo-900 text-white shadow-lg">
        <div class="container mx-auto px-4 py-6">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-spa text-3xl text-indigo-300"></i>
                    <h1 class="text-2xl font-bold">Shiatsu</h1>
                </div>
                <nav class="hidden md:flex space-x-6">
                    <a href="#" class="hover:text-indigo-300 transition">Home</a>
                    <a href="#" class="hover:text-indigo-300 transition">Booking</a>
                    <a href="#" class="hover:text-indigo-300 transition">Impressum</a>
                </nav>
                <button class="md:hidden text-2xl">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </div>
    </header>

    <section class="bg-gray-100 py-16">
        </section>






<section class="bg-gray-100 py-12">
  <div class="container mx-auto px-4">
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="md:flex">
        <div class="md:w-1/2 p-6 border-r border-gray-200">
          <h3 class="text-2xl font-bold text-gray-800 mb-6">Wähle ein Datum</h3>
          <div class="flex justify-between items-center mb-4">
            <button on:click={goToPrevMonth} class="text-gray-600 hover:text-indigo-700"> &lt; </button>
            <h4 class="text-xl font-semibold text-gray-800">{monthYearDisplay}</h4>
            <button on:click={goToNextMonth} class="text-gray-600 hover:text-indigo-700"> &gt; </button>
          </div>
          <div class="grid grid-cols-7 gap-2 mb-4">
            <div class="text-center font-medium text-gray-500 text-sm">Mo</div>
            <div class="text-center font-medium text-gray-500 text-sm">Di</div>
            <div class="text-center font-medium text-gray-500 text-sm">Mi</div>
            <div class="text-center font-medium text-gray-500 text-sm">Do</div>
            <div class="text-center font-medium text-gray-500 text-sm">Fr</div>
            <div class="text-center font-medium text-gray-500 text-sm">Sa</div>
            <div class="text-center font-medium text-gray-500 text-sm">So</div>
          </div>
          <div class="grid grid-cols-7 gap-2">
            {#each calendarDays as day}
              <button
                on:click={() => selectDay(day)}
                class="relative text-center py-2 rounded-full transition-colors duration-200"
                class:text-gray-400={!day.isCurrentMonth || day.isPast}
                class:cursor-not-allowed={!day.isCurrentMonth || day.isPast}
                class:hover:bg-indigo-100={day.isCurrentMonth && !day.isPast && selectedDate?.getTime() !== day.date.getTime()}
                class:bg-indigo-600={day.isToday && selectedDate?.getTime() !== day.date.getTime()}
                class:text-white={day.isToday && selectedDate?.getTime() !== day.date.getTime()}
                class:hover:bg-indigo-700={day.isToday && !day.isPast}
                class:bg-indigo-800={selectedDate?.getTime() === day.date.getTime()}
                class:text-gray-200={selectedDate?.getTime() === day.date.getTime()}
                disabled={!day.isCurrentMonth || day.isPast}
              >
                {day.dayOfMonth}
                {#if day.hasBookings && day.isCurrentMonth && !day.isPast}
                  <span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                {/if}
              </button>
            {/each}
          </div>
        </div>

        <div class="md:w-1/2 p-6">
          {#if selectedDate}
            <h3 class="text-2xl font-bold text-gray-800 mb-6">
              Buchungen für den {selectedDate.toLocaleDateString('de-DE')}
            </h3>
            <div class="space-y-3">
              {#if bookingsForSelectedDate.length > 0}
                {#each bookingsForSelectedDate as booking}
                  <div class="bg-gray-100 p-3 rounded-lg">
                    <p class="font-semibold text-gray-800">{booking.name}</p>
                    <p class="text-sm text-gray-600">
                      Uhrzeit: {new Date(booking.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                    </p>
                    <p class="text-sm text-gray-600">E-Mail: {booking.email}</p>
                    <p class="text-sm text-gray-600">Tel: {booking.phone}</p>
                  </div>
                {/each}
              {:else}
                <p class="text-gray-500">Für diesen Tag gibt es keine Buchungen.</p>
              {/if}

              <button on:click={showBookingForm} class="bg-indigo-700 text-white p-3 rounded-lg mt-4 w-full">
                Neue Buchung hinzufügen
              </button>
            </div>
          {:else}
            <h3 class="text-2xl font-bold text-gray-800 mb-6">Verfügbare Zeiten</h3>
            <p class="text-gray-500">Wähle ein Datum, um die Buchungen zu sehen oder eine neue Buchung zu starten.</p>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>

{#if isBookingFormVisible}
  <div
    on:click={hideBookingForm}
    class="backgroundBuchungAktiv fixed inset-0 flex justify-center items-center z-40"
    role="dialog"
    aria-modal="true"
  >
    <div on:click|stopPropagation class="relative bg-white rounded-xl shadow-lg p-8 m-4 max-w-lg w-full z-50">
      <h3 class="text-2xl font-bold text-gray-800 mb-6">Buchung abschließen</h3>
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
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            bind:value={newBookingName}
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2" for="email">E-Mail</label>
          <input
            type="email"
            id="email"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            bind:value={newBookingEmail}
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2" for="phone">Telefonnummer</label>
          <input
            type="tel"
            id="phone"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            bind:value={newBookingPhone}
            required
          />
        </div>
        <div class="flex justify-between mt-6">
          <button
            type="button"
            on:click={hideBookingForm}
            class="px-4 py-2 text-gray-600 hover:text-indigo-700"
          >
            Zurück
          </button>
          <button
            type="submit"
            class="bg-indigo-700 text-white px-6 py-2 rounded-lg hover:bg-indigo-800 transition"
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
{#if showFailureAnimation}
  <div class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl bg-red-500 text-white fade-in-out">
    {animationMessage}
  </div>
{/if}


    <section class="py-40 bg-gray-100">
        </section>

    <footer class="bg-gray-900 text-white py-12">
        </footer>

<style>
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
            background-color: #3b82f6;
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">