# LinkedIn content audit

## Scope and source boundary

This audit compares the portfolio inventory with Lakshya Agarwal's public
[LinkedIn profile](https://www.linkedin.com/in/lakshya-agarwal-b43515317/).
It was performed on 2026-08-09 using the signed-out, search-indexed public
profile snapshot, indexed posts, and the four-page `Profile.pdf` exported by
Lakshya from LinkedIn. The PDF was read in place and was not copied into the
repository. It contains Experience and Education sections but omits the
LinkedIn Projects section and embeds no project/media URLs. LinkedIn rejected a
direct automated profile request with HTTP 999. The official
[UIUC event calendar](https://calendars.illinois.edu/detail/2568?eventId=33547585)
was used only to resolve the exact QuackTA hackathon date.

After completing the LinkedIn comparison, the public GitHub account and current
local RepoFrame checkout were used as separate evidence sources to fill
portfolio gaps. They do not change the finding that RepoFrame was absent from
LinkedIn's discoverable public snapshot and PDF.

The indexed snapshot was crawled roughly three weeks before the audit. It is a
useful publication source, but it is not a durable source of record: relative
post ages change, LinkedIn can alter public visibility, and `lnkd.in` URLs hide
their final destinations. Final portfolio copy should therefore live in this
repository and use direct evidence links where possible.

## Coverage

| Area | Public LinkedIn evidence | Portfolio action | Remaining gap |
| --- | --- | --- | --- |
| Profile | Computer Engineering at UIUC through May 2029; intelligent IoT, human-centered technology, agentic AI, teaching, and service | Reworked the headline/About narrative and added specific leadership context without publishing the PDF | Optional hobbies and personal media |
| Cisco | May–Aug 2026 Software Engineer Intern; ARC, local SLM reasoning, staged generation, privacy-preserving handoffs, Flask, Cisco IOS XE digital-twin evaluation, and two project-level results | Replaced the draft with a contribution-specific case study and evidence-backed metrics | Final omission review and approved diagram |
| SmartLift Sleeve | Jan–May 2026; three-person ECE 145 project; hardware-only rep/exertion system; detailed personal circuit work; incomplete full MVP; demo and report links | Replaced placeholder copy with sourced dates, role, architecture, contribution, limitation, and direct YouTube/Google Docs links | Optional approved media |
| QuackTA | Mar 28–29, 2026 five-person IEEE hackathon project; Raspberry Pi 5, Arduino Uno R4 Minima, app UI, contextual GPT-4o mini tutoring, scheduling, and expressive mechanics | Replaced placeholder copy, added the official event date, and preserved team attribution | Precise individual subsystem ownership remains unpublished, so the portfolio uses a conservative team-member role |
| Neurify | Aug 2025; Python signal processing and software integration for EEG emotion classification and Spotify control | Replaced the archive placeholder with a sourced summary | Validation evidence for any accuracy or real-time performance claim |
| AgriSense | Aug–Dec 2025; environmental sensing, Flask/Python backend, hardware research, visualization, and recommendations | Replaced the archive placeholder with a sourced summary and public repository link | Concrete personal outcome or optional hardware evidence |
| BackBuddy | Jan–May 2025; posture-sensing vibration circuit, adjustable brace, custom PCB, capstone presentation, second place among 30+ projects | Replaced the archive placeholder and added the published result | Optional photograph, diagram, or presentation evidence |
| RiseNRun | Jul–Aug 2024; embedded firmware, device/network communication, ESP32, MQTT, deployment, and user trials | Strengthened the archive role, evaluation evidence, stack, and public repository link | Optional build media |
| RepoFrame | No discoverable LinkedIn entry; the public GitHub repository and current checkout document the complete product | Replaced the draft with sourced architecture, output, audit, reliability, and contribution copy plus the repository link | Add a LinkedIn project or Featured link if it should reinforce the flagship software story |
| NuCurrent inventory system | Jan–May 2026 Experience entry names the client, stack, frontend workflows, schema/API work, alerts, documentation, and handoff | Replaced the draft with a complete, ownership-specific case study and official NuCurrent/CUBE context links | Approval for any future client screenshots or production data |
| Lucky Arduino Collection | Nov 2023–Aug 2025 Experience entry reports 50+ videos, 50K+ views, 200+ subscribers, and 300+ site visits; repositories document twelve builds | Expanded the archive evidence, role, dates, technologies, metrics, and verified public links | Optional media |

## LinkedIn findings

### Strong content

- SmartLift is unusually credible because it names the system boundaries,
  individual technical work, integration failures, and unfinished scope.
- QuackTA communicates the complete product rather than presenting the model as
  the whole project.
- BackBuddy and RiseNRun include tangible behavior and public presentation
  context, making them stronger than generic technology lists.
- Cisco and NuCurrent now describe owned system boundaries rather than only
  naming technologies, which makes them strong portfolio source material.
- The profile consistently supports a hardware/software/embedded engineering
  identity rather than reading as disconnected projects.

### Corrections and recommendations

1. **Fix the duplicated Cisco sentence.** The Experience paragraph repeats the
   privacy-preserving handoff idea and currently contains `analysis., while`.
   Remove the duplicated clause and repair the punctuation before treating the
   entry as durable public copy.
2. **Resolve the Cisco title mismatch.** The Experience entry says `Software
   Engineer Intern`, while the acceptance post says `Embedded Software
   Engineering Intern`. The portfolio follows the current Experience title;
   make LinkedIn consistent if one is definitively correct.
3. **Remove or update `Freshman`.** The education entry says 2025–2029 but the
   indexed profile still labels the degree `Freshman`. Class standing ages
   poorly; an expected graduation year is more durable.
4. **Clarify the QuackTA model claim.** “Trained a GPT-4o Mini model” can imply
   fine-tuning. If the project used prompting, retrieval, uploaded context, or a
   custom GPT instead, name that mechanism. The portfolio currently uses the
   narrower wording “used GPT-4o Mini with course and schedule context.”
5. **Avoid an unsupported Neurify accuracy claim.** The profile says the work
   ensured accurate, real-time classification but provides no dataset, latency,
   evaluation method, or result. Add evidence or change this to “supported
   real-time classification.” The portfolio does not repeat the accuracy claim.
6. **Replace the current Top Skills.** `Raspberry Pi`, `Time Management`, and
   `Mobile Applications` do not represent the strongest current evidence. A
   tighter set around agentic systems, embedded/IoT development, and full-stack
   engineering would align better with the Experience section.
7. **Add RepoFrame to LinkedIn.** NuCurrent is present in Experience, but
   RepoFrame remains absent from both the signed-out profile and PDF even though
   it is the flagship independent software project.
8. **Use direct links instead of `lnkd.in` in durable project records.** This is
   resolved in the portfolio: the signed-out LinkedIn interstitial exposed the
   YouTube demo and Google Docs report destinations, which now replace both
   shortened URLs.
9. **Reconcile public email choices.** The PDF exposes a Gmail address while the
   portfolio uses the UIUC address. Both may be intentional, but selecting one
   primary professional contact would reduce ambiguity.
10. **Review the profile location after the internship.** The indexed profile
   lists Campbell, California while education is based at UIUC. That may be
   intentional for the summer, but a durable region or school location will age
   better if the profile is not updated each move.
11. **Rebalance the profile toward current engineering work.** Eagle Scout and
   the two Presidential Volunteer Service Awards strengthen the leadership
   story. The long list of individual AP scores and the SAT are reasonable for
   an early undergraduate profile, but they will become lower-signal than
   shipped work, internships, and project evidence. Retire them as the latter
   sections grow.
12. **Use the Featured section as an evidence layer.** Pin the strongest Cisco
   post, RepoFrame, and one physical-system demo. That would let a reader verify
   the software/AI/hardware range promised by the About line without searching
   through Activity.
13. **Proofread durable labels.** The indexed test-score title “AP US Government
    and Politica” appears truncated or misspelled, and the RiseNRun title uses
    `WIFI` rather than `Wi-Fi`. The PDF also shows two context-free West Valley
    College education entries; merge or annotate them if they are meant to
    communicate dual-enrollment coursework.

## Evidence discipline

This audit treats a user-authored LinkedIn description as approval for the same
or narrower factual wording in the portfolio. It does not convert marketing
phrasing into measured evidence, infer individual ownership from a team result,
or infer exact dates from relative post ages. Missing LinkedIn coverage remains
missing rather than being filled with plausible copy.
