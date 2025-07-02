<script lang="ts">
  import Flower from "../slider/+page.svelte";

  interface Termin {
    id: number;
    date: string; // ISO 8601 String (YYYY-MM-DDTHH:mm:ss)
    time: number; // Dauer in Minuten
  }

  let dates: Termin[] = [
    {id: 1, date: '2025-07-15T10:00:00', time: 60},
    {id: 2, date: '2025-07-15T11:00:00', time: 60},
    {id: 3, date: '2025-07-15T12:00:00', time: 60},
    {id: 4, date: '2025-07-16T10:00:00', time: 60},
    {id: 5, date: '2025-07-16T11:00:00', time: 60},
    {id: 6, date: '2025-07-16T12:00:00', time: 60},
    {id: 7, date: '2025-07-03T09:00:00', time: 60}, // Beispiel für heute oder in der Vergangenheit
    {id: 8, date: '2025-07-03T10:00:00', time: 60},
    {id: 9, date: '2025-07-03T11:00:00', time: 60},
  ];

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
    { id: 4, name: 'Jane Doe', date: '2025-08-01T09:00:00', email: 'jane@example.com', phone: '0345678901' },
    { id: 5, name: 'Anna Test', date: '2025-07-03T09:00:00', email: 'anna@example.com', phone: '0111222333' }
  ];

  function toYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  $: bookableDatesSet = new Set([
      //...bookings.map((b) => toYYYYMMDD(new Date(b.date))),
      ...dates.map((t) => toYYYYMMDD(new Date(t.date)))
  ]);

  let currentDate = new Date();
  let selectedDate: Date | null = new Date();

  let newBookingName: string = '';
  let newBookingEmail: string = '';
  let newBookingPhone: string = '';
  let newBookingTime: string = '';
  let bookingFormError: string = '';

  let showSuccessAnimation: boolean = false;
  let showFailureAnimation: boolean = false;
  let animationMessage: string = '';

  // Verfügbare Zeiten basierend auf ausgewähltem Datum und "dates"-Array, gefiltert nach bereits gebuchten Zeiten
  $: availableTimesForSelectedDate = selectedDate
    ? dates
        .filter(t => {
            const terminDate = new Date(t.date);
            return terminDate.getFullYear() === selectedDate!.getFullYear() &&
                   terminDate.getMonth() === selectedDate!.getMonth() &&
                   terminDate.getDate() === selectedDate!.getDate();
        })
        .map(t => {
            const terminTime = new Date(t.date);
            return {
                time: terminTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
                dateTime: terminTime // Speichere das vollständige Datum/Uhrzeit-Objekt
            };
        })
        .filter(timeSlot => {
            // Überprüfe, ob es eine existierende Buchung gibt, die diesen spezifischen Termin belegt
            return !bookings.some(booking => {
                const bookingDateTime = new Date(booking.date);
                return bookingDateTime.getTime() === timeSlot.dateTime.getTime();
            });
        })
        .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()) // Sortiere nach Zeit
        .map(slot => slot.time) // Gib nur die Zeit als String zurück für das Dropdown
    : [];


  $: {
      if (selectedDate && availableTimesForSelectedDate.length > 0) {
          newBookingTime = availableTimesForSelectedDate[0];
      } else if (selectedDate && availableTimesForSelectedDate.length === 0) {
          newBookingTime = '';
      }
  }


  $: calendarDays = generateCalendarDays(currentDate);
  $: monthYearDisplay = currentDate.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric'
  });

  // Diese reaktive Variable ist jetzt NUR für die Anzeige der gebuchten Termine (wenn benötigt)
  // Im rechten Bereich zeigen wir jetzt 'availableTimesForSelectedDate' an.
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
      days.push({ date: day, dayOfMonth: day.getDate(), isCurrentMonth: false, isToday: false, hasBookings: false, isPast: day < today });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const day = new Date(year, month, i);
      const hasBookingsOrAvailableSlots = bookableDatesSet.has(toYYYYMMDD(day));
      days.push({
        date: day,
        dayOfMonth: i,
        isCurrentMonth: true,
        isToday: day.getTime() === today.getTime(),
        hasBookings: hasBookingsOrAvailableSlots,
        isPast: day < today
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push({ date: day, dayOfMonth: day.getDate(), isCurrentMonth: false, isToday: false, hasBookings: false, isPast: day < today });
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
    if (!day.isCurrentMonth || day.isPast) return;
    selectedDate = day.date;
  }

  function showBookingForm() {
    if (!selectedDate) {
      alert('Bitte wählen Sie zuerst ein Datum aus!');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
        alert('Sie können keine Buchung für ein vergangenes Datum hinzufügen.');
        return;
    }

    if (availableTimesForSelectedDate.length === 0) {
        alert('Für das ausgewählte Datum sind keine freien Termine verfügbar.');
        return;
    }

    newBookingName = '';
    newBookingEmail = '';
    newBookingPhone = '';
    newBookingTime = availableTimesForSelectedDate[0];
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
        bookingFormError = 'Buchungen für vergangene Daten sind nicht erlaubt.';
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

    // Überprüfung, ob die gewählte Zeit überhaupt im "dates"-Array existiert
    const isTimeSlotValid = dates.some(t => {
        const terminDate = new Date(t.date);
        return terminDate.getFullYear() === newBookingDateTime.getFullYear() &&
               terminDate.getMonth() === newBookingDateTime.getMonth() &&
               terminDate.getDate() === newBookingDateTime.getDate() &&
               terminDate.getHours() === newBookingDateTime.getHours() &&
               terminDate.getMinutes() === newBookingDateTime.getMinutes();
    });

    if (!isTimeSlotValid) {
        bookingFormError = 'Der ausgewählte Termin ist nicht verfügbar oder existiert nicht.';
        return;
    }

    // --- Kollisionsprüfung (bereits gebuchte Zeiten) ---
    // Hier prüfen wir jetzt, ob die ZEIT, die der Nutzer ausgewählt hat, bereits belegt ist.
    // Da wir 'availableTimesForSelectedDate' filtern, sollte das hier nur eine doppelte Sicherheit sein.
    const newBookingTimeMillis = newBookingDateTime.getTime();

    const oneHourInMillis = 60 * 60 * 1000;
    const terminDurationMillis = 60 * 60 * 1000;

    const bookingsOnSelectedDay = bookings.filter((booking) => {
        const existingBookingDate = new Date(booking.date);
        return (
          existingBookingDate.getFullYear() === selectedDate!.getFullYear() &&
          existingBookingDate.getMonth() === selectedDate!.getMonth() &&
          existingBookingDate.getDate() === selectedDate!.getDate()
        );
    });

    for (const existingBooking of bookingsOnSelectedDay) {
        const existingBookingStartMillis = new Date(existingBooking.date).getTime();
        const existingBookingEndMillis = existingBookingStartMillis + terminDurationMillis; // Annahme: 60 Minuten

        const newBookingStartWithBuffer = newBookingTimeMillis - oneHourInMillis;
        const newBookingEndWithBuffer = newBookingTimeMillis + terminDurationMillis + oneHourInMillis;

        const existingBookingStartWithBuffer = existingBookingStartMillis - oneHourInMillis;
        const existingBookingEndWithBuffer = existingBookingEndMillis + oneHourInMillis;

        const collision = false;
            //(newBookingStartWithBuffer < existingBookingEndWithBuffer && newBookingEndWithBuffer > existingBookingStartWithBuffer);

        if (collision) {
            bookingFormError = `Kollision: Für diesen Zeitpunkt existiert bereits eine Buchung oder ist innerhalb einer Stunde um eine bestehende Buchung (z.B. ${new Date(existingBooking.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr).`;
            return;
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

      hideBookingForm();
    animationMessage = 'Buchung erfolgreich hinzugefügt!';
    showSuccessAnimation = true;
    setTimeout(() => (showSuccessAnimation = false), 3000);
  }
  
</script>

    <div class="container mx-auto">
      <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div class="md:flex">
          <div class="md:w-1/2 p-6 border-r border-gray-200">
            <h3 class="text-2xl font-heading text-gray-800 mb-6">Wähle ein Datum</h3>
            <div class="flex justify-between items-center mb-4">
              <button on:click={goToPrevMonth} class="text-gray-600 hover:text-teal-700"> &lt; </button>
              <h4 class="text-xl font-semibold text-gray-800">{monthYearDisplay}</h4>
              <button on:click={goToNextMonth} class="text-gray-600 hover:text-teal-700"> &gt; </button>
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
                  class:hover:bg-teal-100={day.isCurrentMonth && !day.isPast && selectedDate?.getTime() !== day.date.getTime()}
                  class:bg-teal-500={day.isToday && selectedDate?.getTime() !== day.date.getTime()}
                  class:text-white={day.isToday && selectedDate?.getTime() !== day.date.getTime()}
                  class:hover:bg-teal-600={day.isToday && !day.isPast}
                  class:bg-teal-700={selectedDate?.getTime() === day.date.getTime()}
                  class:text-gray-100={selectedDate?.getTime() === day.date.getTime()}
                  class:cursor-not-allowed={!day.isCurrentMonth || day.isPast}
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
              <h3 class="text-2xl font-heading text-gray-800 mb-6">
                Freie Termine für den {selectedDate.toLocaleDateString('de-DE')}
              </h3>
              <div class="space-y-3">
                {#if availableTimesForSelectedDate.length > 0}
                  {#each availableTimesForSelectedDate as timeSlot}
                    <div class="bg-green-100 p-3 rounded-lg border border-green-200">
                      <p class="font-semibold text-green-800">
                        {timeSlot} Uhr
                      </p>
                      <p class="text-sm text-green-600">Verfügbar</p>
                    </div>
                  {/each}
                {:else}
                  <p class="text-gray-500">Für diesen Tag sind keine freien Termine verfügbar.</p>
                {/if}

                <button on:click={showBookingForm} class="bg-teal-500 text-white p-3 rounded-lg mt-4 w-full hover:bg-teal-600 transition shadow"
                        hidden={availableTimesForSelectedDate.length === 0 || selectedDate < new Date(new Date().setHours(0,0,0,0))}>
                  Neue Buchung hinzufügen
                </button>
                {#if selectedDate && availableTimesForSelectedDate.length === 0}
                    <p class="text-red-500 text-sm mt-2">Es gibt keine buchbaren Termine für diesen Tag.</p>
                {/if}
              </div>
            {:else}
              <h3 class="text-2xl font-heading text-gray-800 mb-6">Verfügbare Zeiten</h3>
              <p class="text-gray-500">Wähle ein Datum, um die freien Termine zu sehen oder eine neue Buchung zu starten.</p>
            {/if}
          </div>
        </div>
      </div>
    </div>

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
              required
            >
              {#each availableTimesForSelectedDate as time}
                <option value={time}>{time}</option>
              {/each}
              {#if availableTimesForSelectedDate.length === 0}
                <option value="" disabled>Keine Zeiten verfügbar</option>
              {/if}
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
              disabled={availableTimesForSelectedDate.length === 0}
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
  <style>
  .backgroundBuchungAktiv {
    background-color: rgba(0, 0, 0, 0.4);
  }

  /* --- NEU: CSS für die Animationen --- */
  .fade-in-out {
    animation: fadeInOut 3s forwards;
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